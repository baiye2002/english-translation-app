# Web 版 + Vercel 部署指南

本文档详细介绍如何将英语学习应用部署为 Web 版本，前端使用 Vercel，后端使用 Railway。

---

## 🎯 部署架构

```
┌─────────────┐         ┌─────────────┐
│   Vercel    │  HTTPS  │  Railway    │
│  (前端)     │────────▶│  (后端)     │
│   免费      │         │   免费      │
└─────────────┘         └─────────────┘
       │                        │
       ▼                        ▼
  用户浏览器              Supabase 数据库
  (手机/电脑)               (免费)
```

---

## 📋 前置要求

1. **GitHub 账号**：用于代码托管
2. **Vercel 账号**：使用 GitHub 登录
3. **Railway 账号**：使用 GitHub 登录
4. **Supabase 项目**：已有数据库

---

## 🚀 第一步：部署后端到 Railway

### 1.1 准备代码

确保后端代码已提交到 GitHub 仓库。

### 1.2 创建 Railway 项目

1. 访问 https://railway.app/
2. 点击 "New Project"
3. 点击 "Deploy from GitHub repo"
4. 选择你的项目仓库
5. Railway 会自动检测 Express 应用

### 1.3 配置环境变量

在 Railway 项目中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | 你的 Supabase 数据库连接字符串 | 必需 |
| `COZE_PROJECT_ID` | `7623665204819198003` | 必需 |
| `PORT` | `9091` | 可选 |
| `NODE_ENV` | `production` | 可选 |

**获取 DATABASE_URL**：
1. 访问 https://supabase.com/
2. 进入你的项目
3. Settings → Database
4. 复制 "Connection string" (PostgreSQL)

### 1.4 配置构建和启动命令

Railway 会自动检测，但可以手动配置：

```
Build Command: cd server && pnpm install
Start Command: cd server && pnpm start
```

### 1.5 部署

点击 "Deploy" 按钮，等待部署完成。

部署成功后，Railway 会提供一个 URL，如：
```
https://english-learning-backend.railway.app
```

**记录这个 URL，后面会用到！**

---

## 🌐 第二步：构建前端 Web 版

### 2.1 确认前端配置

检查 `client/app.config.ts`（或 `client/app.json`）：

```typescript
export default {
  expo: {
    name: "英语学习",
    slug: "english-learning",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.englishlearning.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      backendBaseUrl: "https://english-learning-backend.railway.app"
    }
  }
};
```

**重要**：将 `backendBaseUrl` 改为你的 Railway 后端 URL。

### 2.2 构建 Web 版

```bash
cd /workspace/projects/client
npx expo export
```

这会在 `client/dist/` 目录下生成 Web 版本的静态文件。

---

## 📦 第三步：部署前端到 Vercel

### 3.1 安装 Vercel CLI

```bash
npm install -g vercel
```

### 3.2 登录 Vercel

```bash
vercel login
```

按照提示，使用 GitHub 账号登录。

### 3.3 部署

```bash
cd /workspace/projects/client
vercel
```

按照提示操作：

```
? Set up and deploy “~/client”? [Y/n] y
? Which scope do you want to deploy to? Your Username
? Link to existing project? [y/N] n
? What's your project's name? english-learning
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

Vercel 会自动检测并配置：
```
Build Command: npx expo export
Output Directory: dist
Install Command: pnpm install
```

### 3.4 配置环境变量（可选）

如果需要动态配置后端地址：

1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. Settings → Environment Variables
4. 添加：
   ```
   EXPO_PUBLIC_BACKEND_BASE_URL=https://english-learning-backend.railway.app
   ```

### 3.5 重新部署

添加环境变量后，需要重新部署：

```bash
vercel --prod
```

### 3.6 获取部署 URL

部署成功后，Vercel 会提供一个 URL，如：
```
https://english-learning.vercel.app
```

---

## ✅ 第四步：测试验证

### 4.1 测试后端 API

```bash
curl https://english-learning-backend.railway.app/api/v1/health
```

应该返回：
```json
{"status":"ok"}
```

### 4.2 测试前端访问

在浏览器中打开 Vercel 提供的 URL：
```
https://english-learning.vercel.app
```

### 4.3 测试完整流程

1. 获取题目
2. 提交答案
3. 获取提示
4. 确认一切正常

---

## 🔄 第五步：自动部署配置（可选）

### 配置 GitHub 自动部署

每次推送到 GitHub，Vercel 和 Railway 会自动重新部署。

### Railway 自动部署

Railway 已经配置了 GitHub 集成，推送代码会自动部署。

### Vercel 自动部署

1. 在 Vercel 项目中
2. Settings → Git
3. 确认连接了正确的仓库和分支

---

## 📱 第六步：访问应用

### Web 访问

在浏览器中打开：
```
https://english-learning.vercel.app
```

支持：
- ✅ 电脑浏览器（Chrome、Safari、Firefox 等）
- ✅ 手机浏览器（Chrome Mobile、Safari Mobile 等）
- ✅ 平板浏览器

### 添加到主屏幕（推荐）

**iOS (iPhone/iPad)**：
1. 用 Safari 打开应用
2. 点击 "分享" 按钮
3. 选择 "添加到主屏幕"
4. 点击 "添加"

**Android**：
1. 用 Chrome 打开应用
2. 点击菜单（三个点）
3. 选择 "添加到主屏幕"
4. 点击 "添加"

这样应用会像原生应用一样运行。

---

## 🔧 故障排除

### 问题 1：前端无法连接后端

**症状**：前端显示网络错误

**解决**：
1. 检查 Railway 后端是否正常运行
2. 检查 `backendBaseUrl` 是否正确
3. 检查 Railway 后端是否配置了 CORS

### 问题 2：CORS 错误

**症状**：浏览器控制台显示 CORS 错误

**解决**：
确保后端启用了 CORS：

```typescript
// server/src/index.ts
import cors from 'cors';

app.use(cors());
```

### 问题 3：环境变量未生效

**症状**：前端无法读取环境变量

**解决**：
1. 确认变量名以 `EXPO_PUBLIC_` 开头
2. 在 Vercel 中添加环境变量
3. 重新部署

### 问题 4：构建失败

**症状**：Vercel 构建失败

**解决**：
1. 检查 `package.json` 中的依赖
2. 确认 `npx expo export` 在本地能成功运行
3. 查看构建日志找出具体错误

---

## 💰 成本说明

### Railway（后端）

- **免费额度**：$5/月
- **包含**：
  - 512MB RAM
  - 0.5 CPU
  - 1GB 存储
- **适合**：小型应用，流量不大

### Vercel（前端）

- **完全免费**
- **包含**：
  - 无限静态托管
  - 全球 CDN
  - 自动 HTTPS
  - 自动部署

### Supabase（数据库）

- **免费额度**：500MB 数据库
- **包含**：
  - PostgreSQL 数据库
  - 认证系统
  - 实时订阅

**总成本：$0/月**（小型应用）

---

## 🚀 优化建议

### 1. 启用缓存

在 Vercel 中启用缓存加速加载：

创建 `vercel.json`：
```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. 启用压缩

Vercel 自动启用压缩，无需额外配置。

### 3. 配置自定义域名

在 Vercel 项目中：
1. Settings → Domains
2. 添加你的域名（如 `app.yourdomain.com`）
3. 按照提示配置 DNS

---

## 📊 监控和维护

### Railway 监控

- 访问 Railway 控制台
- 查看 CPU、内存使用情况
- 查看访问日志

### Vercel 监控

- 访问 Vercel 控制台
- 查看访问统计
- 查看部署历史
- 查看错误日志

### 日志查看

**Railway 日志**：
```bash
# 在 Railway 控制台中查看
```

**Vercel 日志**：
```bash
# 在 Vercel 控制台 → Logs 中查看
```

---

## 🎯 总结

### 部署流程回顾

1. ✅ 部署后端到 Railway（免费）
2. ✅ 构建前端 Web 版
3. ✅ 部署前端到 Vercel（免费）
4. ✅ 配置环境变量
5. ✅ 测试验证
6. ✅ 访问应用

### 最终效果

- ✅ **完全免费**：Railway + Vercel + Supabase
- ✅ **多端访问**：手机、电脑、平板
- ✅ **自动 HTTPS**：Vercel 自动配置
- ✅ **全球 CDN**：快速访问
- ✅ **自动部署**：推送代码自动更新

### 访问地址

```
前端：https://english-learning.vercel.app
后端：https://english-learning-backend.railway.app
```

---

## 📞 支持

遇到问题？

- **Vercel 文档**：https://vercel.com/docs
- **Railway 文档**：https://docs.railway.app/
- **Expo Web 文档**：https://docs.expo.dev/deploy/web/

---

祝部署顺利！🎉
