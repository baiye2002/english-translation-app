# 英语学习应用部署指南

本文档将指导你如何在自己的手机或电脑上使用这个英语学习应用。

## 📱 应用架构

应用由两部分组成：

1. **前端（手机端）**：Expo 应用，提供用户界面和交互
2. **后端（服务器）**：Express 服务，提供 API 接口和数据处理

## 🎯 三种使用方案

### 方案 1：Expo Go（最简单，适合快速体验）

**适合人群**：想快速体验应用的开发者或测试者

#### 步骤 1：部署后端到 Railway

1. 访问 https://railway.app/ 并登录（使用 GitHub 账号）
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的代码仓库
4. Railway 会自动检测 Express 应用
5. 配置环境变量：
   ```
   DATABASE_URL=你的Supabase数据库连接字符串
   COZE_PROJECT_ID=你的Coze项目ID
   ```
6. 点击 "Deploy"，等待部署完成
7. 部署完成后，Railway 会提供一个域名，如 `https://xxx.railway.app`

#### 步骤 2：在手机上安装 Expo Go

**iOS（iPhone）**：
- 打开 App Store
- 搜索 "Expo Go"
- 下载并安装

**Android**：
- 打开 Google Play
- 搜索 "Expo Go"
- 下载并安装

#### 步骤 3：启动开发服务器

在开发电脑上运行：

```bash
cd /workspace/projects/client
npx expo start
```

#### 步骤 4：手机扫码连接

1. 在终端中会显示一个二维码
2. 打开手机上的 Expo Go 应用
3. 点击 "Scan QR Code"
4. 扫描终端中的二维码
5. 应用会在手机上打开

**注意事项**：
- 手机和电脑需要在同一个 WiFi 网络下
- 或使用 Expo Tunnel（需要网络连接）

---

### 方案 2：构建独立应用（适合正式使用）

**适合人群**：想要独立应用的用户

#### 步骤 1：配置 EAS Build

```bash
# 全局安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login
```

#### 步骤 2：配置项目

```bash
cd /workspace/projects/client

# 初始化 EAS 配置
eas build:configure
```

这会创建 `eas.json` 文件。

#### 步骤 3：修改 app.config.ts

确保配置正确的后端地址：

```typescript
export default {
  expo: {
    extra: {
      backendBaseUrl: "https://你的后端域名.railway.app"
    }
  }
}
```

#### 步骤 4：构建 Android APK

```bash
# 构建开发版（快速，用于测试）
eas build --platform android --profile development

# 构建预览版（较慢，用于分享）
eas build --platform android --profile preview
```

构建完成后，Expo 会提供下载链接。

#### 步骤 5：安装 APK

1. 下载 APK 文件
2. 在手机设置中启用"安装未知来源应用"
3. 打开 APK 文件安装

#### iOS 用户

iOS 需要付费开发者账号（$99/年）：

1. 注册 Apple Developer Program
2. 配置 EAS 使用你的 Apple 账号
3. 构建应用：
   ```bash
   eas build --platform ios --profile preview
   ```
4. 使用 TestFlight 进行测试
5. 或提交到 App Store

---

### 方案 3：Web 版本（电脑浏览器）

**适合人群**：想在电脑上使用的用户

#### 步骤 1：构建 Web 版

```bash
cd /workspace/projects/client
npx expo export
```

这会生成 `dist/` 目录，包含 Web 版本的所有文件。

#### 步骤 2：部署到 Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
cd /workspace/projects/client
vercel
```

按照提示操作：
1. 输入你的邮箱
2. 选择项目设置（默认即可）
3. 等待部署完成

部署后，Vercel 会提供一个 URL，如 `https://xxx.vercel.app`

#### 步骤 3：访问应用

在浏览器中打开 Vercel 提供的 URL 即可使用。

---

## 🌐 其他后端部署方案

### Render

1. 访问 https://render.com/
2. 点击 "New" → "Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - Build Command: `cd server && pnpm install`
   - Start Command: `cd server && pnpm start`
5. 添加环境变量
6. 点击 "Create Web Service"

### 自建服务器

如果你有自己的服务器：

```bash
# 1. 安装 Node.js
# 2. 安装 pnpm
npm install -g pnpm

# 3. 克隆代码
git clone 你的仓库地址
cd 你的项目

# 4. 安装依赖
cd server && pnpm install

# 5. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，添加你的配置

# 6. 启动服务
pnpm start

# 7. 使用 PM2 守护进程（推荐）
npm install -g pm2
pm2 start src/index.ts --name english-app
pm2 save
pm2 startup
```

---

## 📋 环境变量配置清单

### 后端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | Supabase 数据库连接字符串 | `postgresql://...` |
| `COZE_PROJECT_ID` | Coze 项目 ID | `7623665204819198003` |
| `PORT` | 服务端口 | `9091` |

### 前端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `EXPO_PUBLIC_BACKEND_BASE_URL` | 后端 API 地址 | `https://xxx.railway.app` |

---

## 🚀 快速部署推荐组合

### 最简单：Expo Go + Railway

```
后端：Railway（免费额度）
前端：Expo Go 扫码
总成本：$0
时间：15 分钟
```

### 独立应用：EAS Build + Railway

```
后端：Railway（$5/月起）
前端：EAS Build（免费）
总成本：$5/月起
时间：1 小时
```

### Web 版本：Vercel + Railway

```
后端：Railway（免费额度）
前端：Vercel（免费）
总成本：$0
时间：30 分钟
```

---

## ❓ 常见问题

### Q: Expo Go 能扫描到二维码但打不开应用？

A: 确保手机和电脑在同一 WiFi 网络，或使用 Expo Tunnel 模式。

### Q: 构建应用很慢怎么办？

A:
- 使用 `--profile development` 加速构建
- 第一次构建会慢，后续会利用缓存
- 使用 EAS Build 的构建缓存功能

### Q: Railway 免费额度够用吗？

A: Railway 提供 $5 免费额度，小型应用基本够用。不够的话可以切换到 Render（有永久免费版）。

### Q: 如何更新应用？

A:
- Expo Go：重新启动开发服务器，刷新应用即可
- APK：重新构建并安装新版本
- Web：重新部署，Vercel 会自动更新

---

## 📚 更多资源

- [Expo 官方文档](https://docs.expo.dev/)
- [EAS Build 指南](https://docs.expo.dev/build/introduction/)
- [Railway 官方文档](https://docs.railway.app/)
- [Vercel 官方文档](https://vercel.com/docs)

---

需要帮助？请查看各平台的官方文档或在社区提问。
