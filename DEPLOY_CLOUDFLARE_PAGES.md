# 方案 2：Cloudflare Pages（完全免费）

## 🎯 方案概述

Cloudflare Pages 是 Cloudflare 提供的静态网站托管服务，完全免费，在中国大陆访问相对稳定。

**优势**：
- ✅ 完全免费（无限带宽）
- ✅ 无需自定义域名
- ✅ 全球 CDN 加速
- ✅ 中国大陆访问相对稳定
- ✅ 自动 HTTPS
- ✅ 支持 GitHub 集成（自动部署）

**限制**：
- 仅支持静态网站
- 不支持后端（Express 需要单独部署）

---

## 📋 前置条件

- GitHub 仓库（已有）
- Cloudflare 账号（免费）

---

## 🚀 配置步骤

### 步骤 1：注册 Cloudflare（1分钟）

1. 访问：https://dash.cloudflare.com/sign-up
2. 使用邮箱注册账号
3. 完成 Email 验证

---

### 步骤 2：创建 Pages 项目（3分钟）

1. 登录 Cloudflare 控制台
2. 点击左侧菜单 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** 标签
5. 点击 **Connect to Git**

---

### 步骤 3：连接 GitHub 仓库（2分钟）

1. 点击 **Connect to GitHub**
2. 授权 Cloudflare 访问你的 GitHub
3. 选择你的仓库：`baiye2002/english-translation-app`
4. 点击 **Begin setup**

---

### 步骤 4：配置构建设置（2分钟）

#### 4.1 项目名称
- Project name: `english-translation-app`
- Production branch: `main`

#### 4.2 构建设置

| 配置项 | 值 |
|--------|-----|
| Framework preset | `Create one` |
| Build command | `cd client && npm run build` |
| Build output directory | `client/dist` |

**重要**：
- 由于你的项目是 monorepo（包含 client 和 server 目录）
- 需要先进入 client 目录再构建

#### 4.3 环境变量

添加以下环境变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `EXPO_PUBLIC_BACKEND_BASE_URL` | `https://your-backend.railway.app` | Production |

4. 点击 **Save and Deploy**

---

### 步骤 5：等待部署（2-5分钟）

1. Cloudflare 会自动拉取代码并构建
2. 等待部署完成
3. 部署成功后会显示：`Success` 或 `Ready`

---

### 步骤 6：访问网站

部署成功后：
1. Cloudflare 会提供默认域名：`https://english-translation-app.pages.dev`
2. 访问该域名测试

---

## 🔧 配置自定义域名（可选）

### 步骤 1：添加域名

1. 在 Cloudflare Pages 项目页面
2. 点击 **Custom domains**
3. 输入你的域名（例如：`english-translation.com`）
4. 点击 **Set up domain**

### 步骤 2：配置 DNS

Cloudflare 会自动添加 DNS 记录，无需手动配置。

---

## 🎯 后端部署

Cloudflare Pages 仅支持静态网站，后端需要单独部署。

### 推荐方案：Railway + Cloudflare Workers

#### 方案 A：继续使用 Railway

1. 后端部署在 Railway（已部署）
2. 在 Cloudflare Pages 中配置环境变量指向 Railway
3. Railway 提供的域名在中国访问可能不稳定

#### 方案 B：Cloudflare Workers（完全免费）

1. 将 Express 后端改造为 Cloudflare Workers
2. 完全免费，无限请求
3. 需要修改后端代码

**推荐**：继续使用 Railway，前端通过 Cloudflare Pages 部署。

---

## 📊 性能优化

### 1. 启用 HTTP/3

在 Cloudflare Pages 项目设置：
1. 进入项目设置
2. 开启 **HTTP/3 (QUIC)**

### 2. 配置缓存

在 Cloudflare 控制台：
1. 进入 **Caching** -> **Configuration**
2. 配置缓存规则

### 3. 压缩资源

在 Cloudflare Pages 项目设置：
1. 进入项目设置
2. 开启 **Auto Minify**

---

## ⚠️ 注意事项

### 1. monorepo 项目

由于你的项目包含 client 和 server 目录：

**构建命令**：
```bash
cd client && npm run build
```

**输出目录**：
```
client/dist
```

### 2. 依赖安装

确保 `client/package.json` 包含：
```json
{
  "scripts": {
    "build": "expo export"
  }
}
```

### 3. 环境变量

确保在 Cloudflare Pages 中配置：
```
EXPO_PUBLIC_BACKEND_BASE_URL = https://your-backend.railway.app
```

### 4. 免费额度

Cloudflare Pages 免费计划：
- ✅ 无限带宽
- ✅ 无限请求
- ✅ 500 个构建/月
- ✅ 20 分钟构建时间限制

---

## 🎉 完成后

配置完成后：
1. 访问：`https://english-translation-app.pages.dev`
2. 在中国可以稳定访问
3. 全球 CDN 加速

---

## 🆘 故障排查

### 问题 1：构建失败

**可能原因**：
- 依赖安装失败
- 构建命令错误
- 超时（超过 20 分钟）

**解决**：
1. 检查 Build Logs
2. 确认构建命令正确：`cd client && npm run build`
3. 确认输出目录正确：`client/dist`

### 问题 2：访问 404

**可能原因**：
- 输出目录配置错误
- 构建失败

**解决**：
1. 检查输出目录是否为 `client/dist`
2. 检查构建是否成功
3. 重新部署

### 问题 3：后端连接失败

**可能原因**：
- 环境变量未配置
- 后端地址错误

**解决**：
1. 确认环境变量已配置
2. 确认后端地址正确
3. 测试后端是否可访问

---

## 📞 资源链接

- Cloudflare Pages 文档：https://developers.cloudflare.com/pages/
- Cloudflare Pages 配置指南：https://developers.cloudflare.com/pages/configuration/
- Cloudflare Pages 限制：https://developers.cloudflare.com/pages/platform/limits/

---

## 🆚 与 Vercel 对比

| 特性 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| 免费 | 有限制 | 无限制 |
| 国内访问 | 不稳定 | 相对稳定 |
| 带宽 | 100GB/月 | 无限 |
| 构建次数 | 无限 | 500次/月 |
| 构建时间 | 无限 | 20分钟 |
| 自定义域名 | 需要 | 可选 |
| 支持 SSR | ✅ | ❌ |

---

**推荐理由**：
- 如果你不需要自定义域名 → Cloudflare Pages（最简单）
- 如果你有域名 → Vercel + Cloudflare（最稳定）
