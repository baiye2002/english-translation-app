# Web 版部署脚本

本文档包含 Web 版部署的执行步骤。

---

## 第一步：构建 Web 版

在 client 目录下执行：

```bash
cd client
npx expo export
```

这会在 `client/dist/` 目录下生成静态文件。

---

## 第二步：本地测试 Web 版

构建完成后，可以在本地测试：

```bash
cd client
npx expo start:web
```

然后在浏览器中打开：`http://localhost:8081`

---

## 第三步：部署到 Vercel

### 3.1 安装 Vercel CLI

```bash
npm install -g vercel
```

### 3.2 登录 Vercel

```bash
vercel login
```

### 3.3 部署

```bash
cd client
vercel
```

### 3.4 配置环境变量

在 Vercel 控制台中添加：

```
EXPO_PUBLIC_BACKEND_BASE_URL=https://你的后端域名.railway.app
```

### 3.5 重新部署

```bash
vercel --prod
```

---

## 注意事项

1. **后端地址配置**：
   - 在 Vercel 中配置 `EXPO_PUBLIC_BACKEND_BASE_URL`
   - 或者修改 `client/app.config.ts` 中的配置

2. **构建产物**：
   - 构建后的文件在 `client/dist/` 目录
   - Vercel 会自动部署这个目录

3. **路由配置**：
   - Web 版使用的是 `history` 模式
   - 需要配置 SPA 路由重写

---

## vercel.json 配置

创建 `client/vercel.json` 文件：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
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

这个配置确保：
- SPA 路由正常工作
- 静态资源被正确缓存
