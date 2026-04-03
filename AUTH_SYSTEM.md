# 用户系统实现方案

本文档详细说明如何实现用户注册、登录、鉴权和管理功能。

---

## 🎯 实现目标

在实现错题本、学习进度等功能之前，必须先完成：
1. ✅ 用户注册/登录
2. ✅ JWT Token 认证
3. ✅ 用户信息管理
4. ✅ 设备 ID 识别（匿名用户）
5. ✅ 权限控制和数据隔离

---

## 📊 当前状态

### ❌ 缺失的功能
- 无用户注册接口
- 无登录接口
- 无 Token 认证中间件
- 无用户信息存储
- 无设备 ID 识别

### ✅ 现有的功能
- 题目获取（无需认证）
- 翻译评判（无需认证）
- 提示生成（无需认证）

---

## 🏗️ 整体架构

### 认证流程

```
用户注册 → 生成 JWT Token → 客户端存储 Token → 后续请求携带 Token → 后端验证 Token
```

### 数据隔离策略

```
每个用户只能访问自己的数据：
- 学习记录 (user_id)
- 错题记录 (user_id)
- 成就记录 (user_id)
- 等级信息 (user_id)

管理员可以访问所有数据（可选）
```

---

## 📦 技术选型

### 认证方式
- **JWT (JSON Web Token)**：无状态认证，适合移动端
- **设备 ID**：匿名用户识别，使用 `expo-crypto` 生成

### 密码加密
- **bcrypt**：密码哈希加密，安全可靠

### 数据库存储
- **用户表**：存储用户基本信息和密码哈希
- **用户设备表**：记录用户设备和登录信息

### 客户端存储
- **AsyncStorage**：存储 JWT Token 和设备 ID

---

## 🗄️ 数据库设计

### 1. 用户表 (users)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user', -- user, admin
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 索引
  INDEX idx_username (username),
  INDEX idx_email (email)
);

COMMENT ON TABLE users IS '用户表';
```

### 2. 用户设备表 (user_devices)

```sql
CREATE TABLE user_devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  device_name VARCHAR(100),
  platform VARCHAR(20), -- ios, android, web
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  INDEX idx_device_id (device_id),
  INDEX idx_user_id (user_id)
);

COMMENT ON TABLE user_devices IS '用户设备表，用于追踪多设备登录';
```

### 3. 密码重置表 (password_resets)

```sql
CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  INDEX idx_token (token),
  INDEX idx_user_id (user_id)
);

COMMENT ON TABLE password_resets IS '密码重置令牌表';
```

---

## 🔧 后端实现

### 目录结构

```
server/src/
├── routes/
│   └── auth.ts              # 认证路由（注册、登录、登出）
├── middleware/
│   └── auth.ts              # JWT 认证中间件
├── services/
│   ├── userService.ts       # 用户服务
│   └── authService.ts       # 认证服务
├── utils/
│   ├── jwt.ts               # JWT 工具
│   └── password.ts          # 密码加密工具
└── types/
    └── auth.ts              # 认证相关类型定义
```

### 1. JWT 工具 (server/src/utils/jwt.ts)

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token 有效期 7 天

export interface JWTPayload {
  userId: number;
  username: string;
  deviceId?: string;
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * 从请求头中提取 Token
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
```

### 2. 密码工具 (server/src/utils/password.ts)

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 3. 认证中间件 (server/src/middleware/auth.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import { extractToken, verifyToken, type JWTPayload } from '../utils/jwt';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      deviceId?: string;
    }
  }
}

/**
 * JWT 认证中间件（必须登录）
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: '未登录，请先登录' });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Token 无效或已过期' });
  }

  req.user = payload;
  next();
}

/**
 * 可选认证中间件（可以匿名访问）
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req.headers.authorization);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  // 尝试从请求头获取设备 ID（匿名用户）
  req.deviceId = req.headers['x-device-id'] as string;

  next();
}
```

### 4. 认证路由 (server/src/routes/auth.ts)

```typescript
import express, { Router, Request, Response } from 'express';
import { register, login, logout, getProfile, updateProfile } from '../services/authService';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/v1/auth/register
 * 用户注册
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, email, nickname } = req.body;

    // 参数验证
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 用户名长度验证
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度为 3-20 个字符' });
    }

    // 密码长度验证
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少 6 个字符' });
    }

    const result = await register({
      username,
      password,
      email,
      nickname,
    });

    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '注册失败';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/v1/auth/login
 * 用户登录
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password, deviceId } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const result = await login(username, password, deviceId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败';
    res.status(401).json({ error: message });
  }
});

/**
 * POST /api/v1/auth/logout
 * 用户登出
 */
router.post('/logout', requireAuth, async (req: Request, res: Response) => {
  try {
    await logout(req.user!.userId);
    res.json({ message: '登出成功' });
  } catch (error) {
    res.status(500).json({ error: '登出失败' });
  }
});

/**
 * GET /api/v1/auth/profile
 * 获取用户信息
 */
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await getProfile(req.user!.userId);
    res.json(profile);
  } catch (error) {
    res.status(404).json({ error: '用户不存在' });
  }
});

/**
 * PUT /api/v1/auth/profile
 * 更新用户信息
 */
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const { nickname, avatarUrl } = req.body;

    const profile = await updateProfile(req.user!.userId, {
      nickname,
      avatarUrl,
    });

    res.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新失败';
    res.status(400).json({ error: message });
  }
});

export default router;
```

### 5. 认证服务 (server/src/services/authService.ts)

```typescript
import { getSupabaseClient } from '../storage/database/supabase-client';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken, type JWTPayload } from '../utils/jwt';

interface RegisterParams {
  username: string;
  password: string;
  email?: string;
  nickname?: string;
}

interface LoginParams {
  username: string;
  password: string;
  deviceId?: string;
}

/**
 * 用户注册
 */
export async function register(params: RegisterParams) {
  const client = getSupabaseClient();

  // 检查用户名是否已存在
  const { data: existingUser } = await client
    .from('users')
    .select('id')
    .eq('username', params.username)
    .maybeSingle();

  if (existingUser) {
    throw new Error('用户名已被使用');
  }

  // 如果提供了邮箱，检查邮箱是否已存在
  if (params.email) {
    const { data: existingEmail } = await client
      .from('users')
      .select('id')
      .eq('email', params.email)
      .maybeSingle();

    if (existingEmail) {
      throw new Error('邮箱已被注册');
    }
  }

  // 哈希密码
  const passwordHash = await hashPassword(params.password);

  // 创建用户
  const { data: user, error } = await client
    .from('users')
    .insert({
      username: params.username,
      password_hash: passwordHash,
      email: params.email || null,
      nickname: params.nickname || params.username,
    })
    .select('id, username, email, nickname, avatar_url')
    .single();

  if (error || !user) {
    throw new Error('注册失败');
  }

  // 生成 Token
  const token = generateToken({
    userId: user.id,
    username: user.username,
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
    },
  };
}

/**
 * 用户登录
 */
export async function login(username: string, password: string, deviceId?: string) {
  const client = getSupabaseClient();

  // 查找用户
  const { data: user, error } = await client
    .from('users')
    .select('id, username, password_hash, email, nickname, avatar_url, is_active')
    .eq('username', username)
    .maybeSingle();

  if (error || !user) {
    throw new Error('用户名或密码错误');
  }

  if (!user.is_active) {
    throw new Error('账号已被禁用');
  }

  // 验证密码
  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new Error('用户名或密码错误');
  }

  // 记录设备信息（如果提供了设备 ID）
  if (deviceId) {
    await client
      .from('user_devices')
      .upsert({
        user_id: user.id,
        device_id: deviceId,
        last_active_at: new Date().toISOString(),
      }, {
        onConflict: 'device_id',
      });
  }

  // 生成 Token
  const token = generateToken({
    userId: user.id,
    username: user.username,
    deviceId,
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
    },
  };
}

/**
 * 用户登出
 */
export async function logout(userId: number) {
  // JWT 是无状态的，登出只需客户端删除 Token
  // 这里可以记录登出日志或清除设备信息
  return { success: true };
}

/**
 * 获取用户信息
 */
export async function getProfile(userId: number) {
  const client = getSupabaseClient();

  const { data: user, error } = await client
    .from('users')
    .select('id, username, email, nickname, avatar_url, role, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error || !user) {
    throw new Error('用户不存在');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    nickname: user.nickname,
    avatarUrl: user.avatar_url,
    role: user.role,
    createdAt: user.created_at,
  };
}

/**
 * 更新用户信息
 */
export async function updateProfile(userId: number, updates: {
  nickname?: string;
  avatarUrl?: string;
}) {
  const client = getSupabaseClient();

  const { data: user, error } = await client
    .from('users')
    .update({
      ...(updates.nickname && { nickname: updates.nickname }),
      ...(updates.avatarUrl && { avatar_url: updates.avatarUrl }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('id, username, email, nickname, avatar_url')
    .single();

  if (error || !user) {
    throw new Error('更新失败');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    nickname: user.nickname,
    avatarUrl: user.avatar_url,
  };
}
```

### 6. 注册路由 (server/src/index.ts)

```typescript
import authRouter from './routes/auth';

// 认证路由
app.use('/api/v1/auth', authRouter);
```

---

## 📱 前端实现

### 依赖安装

```bash
cd client
npx expo install @react-native-async-storage/async-storage
npx expo install expo-crypto
```

### 1. AuthContext (client/contexts/AuthContext.tsx)

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface User {
  id: number;
  username: string;
  email?: string;
  nickname: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  deviceId: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, nickname?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { nickname?: string; avatarUrl?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // 初始化：加载 Token 和生成设备 ID
  useEffect(() => {
    loadAuthData();
  }, []);

  async function loadAuthData() {
    try {
      // 加载 Token
      const savedToken = await AsyncStorage.getItem('auth_token');
      const savedUser = await AsyncStorage.getItem('auth_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }

      // 生成或加载设备 ID
      let savedDeviceId = await AsyncStorage.getItem('device_id');
      if (!savedDeviceId) {
        savedDeviceId = Crypto.randomUUID();
        await AsyncStorage.setItem('device_id', savedDeviceId);
      }
      setDeviceId(savedDeviceId);
    } catch (error) {
      console.error('加载认证数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        deviceId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '登录失败');
    }

    // 保存 Token 和用户信息
    await AsyncStorage.setItem('auth_token', data.token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  }

  async function register(username: string, password: string, nickname?: string) {
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        nickname,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '注册失败');
    }

    // 保存 Token 和用户信息
    await AsyncStorage.setItem('auth_token', data.token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  }

  async function logout() {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);

    // 导航到登录页
    router.replace('/login');
  }

  async function updateProfile(updates: { nickname?: string; avatarUrl?: string }) {
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '更新失败');
    }

    // 更新本地用户信息
    setUser(data);
    await AsyncStorage.setItem('auth_user', JSON.stringify(data));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        deviceId,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 2. 登录页面 (client/screens/login/index.tsx)

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeRouter } from '@/hooks/useSafeRouter';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useSafeRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('错误', '请输入用户名和密码');
      return;
    }

    setLoading(true);

    try {
      await login(username, password);
      router.replace('/');
    } catch (error) {
      Alert.alert('登录失败', error instanceof Error ? error.message : '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View className="flex-1 justify-center p-6">
        <Text className="text-3xl font-bold text-center mb-8">欢迎回来</Text>

        <View className="mb-4">
          <Text className="mb-2 text-gray-700">用户名</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-lg"
            value={username}
            onChangeText={setUsername}
            placeholder="请输入用户名"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-gray-700">密码</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-lg"
            value={password}
            onChangeText={setPassword}
            placeholder="请输入密码"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="bg-blue-500 p-4 rounded-lg mb-4"
        >
          <Text className="text-white text-center font-bold">
            {loading ? '登录中...' : '登录'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text className="text-blue-500 text-center">
            还没有账号？立即注册
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
```

### 3. 注册页面 (client/screens/register/index.tsx)

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeRouter } from '@/hooks/useSafeRouter';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useSafeRouter();

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('错误', '请输入用户名和密码');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      Alert.alert('错误', '用户名长度为 3-20 个字符');
      return;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码长度至少 6 个字符');
      return;
    }

    setLoading(true);

    try {
      await register(username, password, nickname || username);
      router.replace('/');
    } catch (error) {
      Alert.alert('注册失败', error instanceof Error ? error.message : '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View className="flex-1 justify-center p-6">
        <Text className="text-3xl font-bold text-center mb-8">创建账号</Text>

        <View className="mb-4">
          <Text className="mb-2 text-gray-700">用户名</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-lg"
            value={username}
            onChangeText={setUsername}
            placeholder="3-20 个字符"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-gray-700">昵称（可选）</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-lg"
            value={nickname}
            onChangeText={setNickname}
            placeholder="显示的名称"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-gray-700">密码</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-lg"
            value={password}
            onChangeText={setPassword}
            placeholder="至少 6 个字符"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          className="bg-blue-500 p-4 rounded-lg mb-4"
        >
          <Text className="text-white text-center font-bold">
            {loading ? '注册中...' : '注册'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 text-center">
            已有账号？立即登录
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
```

### 4. 个人中心页面 (client/screens/profile/index.tsx)

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome6 } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Screen>
      <View className="flex-1 p-6">
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-4">
            <FontAwesome6 name="user" size={48} color="white" />
          </View>
          <Text className="text-2xl font-bold">{user?.nickname || user?.username}</Text>
          <Text className="text-gray-500">@{user?.username}</Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-bold">退出登录</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
```

### 5. 在根布局中添加 AuthProvider (client/app/_layout.tsx)

```typescript
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </AuthProvider>
  );
}
```

### 6. 添加登录/注册路由 (client/app/login.tsx 和 register.tsx)

```typescript
// client/app/login.tsx
export { default } from "@/screens/login";

// client/app/register.tsx
export { default } from "@/screens/register";
```

---

## 🔐 认证保护现有路由

### 修改练习路由 (server/src/routes/practice.ts)

```typescript
import { requireAuth, optionalAuth } from '../middleware/auth';

// 提交答案需要登录
router.post('/submit', requireAuth, async (req: Request, res: Response) => {
  const { questionId, userAnswer, difficulty } = req.body;

  // 使用 req.user.userId 替代设备 ID
  const userId = req.user!.userId;

  // ... 其余逻辑
});

// 获取提示可以匿名访问
router.get('/hint/:questionId', optionalAuth, async (req: Request, res: Response) => {
  // req.user 存在则已登录，不存在则为匿名用户
  // ...
});
```

### 修改竞技路由 (server/src/routes/competition.ts)

```typescript
// 创建房间需要登录
router.post('/rooms', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  // ...
});

// 加入房间需要登录
router.post('/rooms/:roomId/join', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  // ...
});
```

---

## 📋 实施步骤

### 第一步：后端基础（1天）
1. ✅ 创建数据库表（users, user_devices）
2. ✅ 实现工具函数（jwt.ts, password.ts）
3. ✅ 实现认证中间件（auth.ts）
4. ✅ 实现认证服务（authService.ts）
5. ✅ 创建认证路由（routes/auth.ts）

### 第二步：前端基础（1天）
1. ✅ 安装依赖（async-storage, expo-crypto）
2. ✅ 实现 AuthContext
3. ✅ 创建登录页面
4. ✅ 创建注册页面
5. ✅ 更新个人中心页面

### 第三步：集成和测试（1天）
1. ✅ 在根布局中添加 AuthProvider
2. ✅ 添加路由配置
3. ✅ 实现认证保护
4. ✅ 测试登录/注册流程
5. ✅ 测试 Token 认证

---

## ⚠️ 注意事项

### 安全性
- ✅ JWT_SECRET 必须使用强随机字符串
- ✅ 密码必须哈希存储（bcrypt）
- ✅ HTTPS 传输（生产环境）
- ✅ Token 有效期不宜过长（建议 7 天）

### 匿名用户
- ✅ 设备 ID 用于识别未登录用户
- ✅ 登录后可以迁移匿名数据到用户账号
- ✅ 使用 expo-crypto 生成设备 ID

### 数据迁移
- ✅ 现有练习记录需要添加 user_id 字段
- ✅ 匿名用户的记录可以保留或迁移

---

## 🎯 完成后的效果

1. ✅ 用户可以注册和登录
2. ✅ JWT Token 认证保护接口
3. ✅ 每个用户数据完全隔离
4. ✅ 支持匿名用户（设备 ID）
5. ✅ 可以实现错题本、学习进度等功能

---

## 📊 后续功能依赖关系

| 功能 | 依赖用户系统 |
|------|--------------|
| 错题本 | ✅ 必需 |
| 学习进度追踪 | ✅ 必需 |
| 积分等级 | ✅ 必需 |
| 成就系统 | ✅ 必需 |
| 好友系统 | ✅ 必需 |
| 排行榜 | ✅ 必需 |

---

**结论**：用户系统是所有后续功能的基础，建议优先实现，预计需要 3 天完成（后端 1 天 + 前端 1 天 + 测试 1 天）。
