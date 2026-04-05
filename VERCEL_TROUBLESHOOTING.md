# Vercel 部署故障排查指南

## 问题现象
Vercel 部署成功后无法打开链接

---

## 🔍 排查步骤

### 1. 检查部署状态

访问 Vercel 控制台：
1. 进入你的项目页面
2. 查看 **Deployments** 标签
3. 检查最新的部署状态：
   - ✅ 绿色对勾：部署成功
   - ❌ 红色叉：部署失败
   - ⚠️ 黄色警告：部署警告

如果是失败或警告，点击查看详细日志。

---

### 2. 检查浏览器控制台错误

打开网站后：
1. 按 `F12` 打开开发者工具
2. 切换到 **Console** 标签
3. 查看是否有红色错误信息

常见错误：

#### 错误 A: 404 Not Found
```
GET https://your-app.vercel.app/_next/static/... 404
```
**原因**：Next.js 配置问题或文件路径错误
**解决**：检查 vercel.json 配置

#### 错误 B: Uncaught Runtime Error
```
Uncaught TypeError: Cannot read property 'xxx' of undefined
```
**原因**：代码运行时错误
**解决**：查看具体的错误堆栈

#### 错误 C: Failed to fetch
```
GET https://your-backend.railway.app/api/v1/... net::ERR_FAILED
```
**原因**：后端连接失败或 CORS 问题
**解决**：检查后端地址和 CORS 配置

---

### 3. 检查 Vercel 部署日志

在 Vercel 控制台中：
1. 点击最新的部署记录
2. 查看 **Build Log**（构建日志）
3. 查看 **Function Log**（函数日志）

常见构建错误：

#### 错误 A: Build script not found
```
Error: Build script 'npm run build' not found in package.json
```
**原因**：缺少构建命令
**解决**：添加构建脚本（见下方）

#### 错误 B: Build failed
```
Build failed with exit code 1
```
**原因**：代码编译错误
**解决**：修复代码错误

#### 错误 C: Out of memory
```
Build failed with exit code 137 (out of memory)
```
**原因**：内存不足
**解决**：升级 Vercel 计划或优化构建

---

## 🔧 解决方案

### 方案 1: 添加构建命令（必须）

在 `client/package.json` 中添加缺失的脚本：

```json
{
  "scripts": {
    "build": "expo export",
    "export": "expo export"
  }
}
```

### 方案 2: 检查 vercel.json 配置

确保 `client/vercel.json` 存在且配置正确：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 方案 3: 配置环境变量

在 Vercel 项目设置中添加环境变量：

1. 进入 **Settings** -> **Environment Variables**
2. 添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `EXPO_PUBLIC_BACKEND_BASE_URL` | `https://your-backend.railway.app` | Production, Preview, Development |

**重要**：
- 确保使用 HTTPS
- 确保后端地址可以访问
- 所有环境都要配置

### 方案 4: 重新部署

修改配置后，强制重新部署：

1. 在 Vercel 控制台，进入 **Deployments** 标签
2. 点击部署记录右侧的 `...` 菜单
3. 选择 **Redeploy**
4. 勾选 "Clear cache and re-deploy without using cache"
5. 点击 **Redeploy**

---

## 🚨 常见问题修复

### 问题 1: 白屏（页面加载但无内容）

**可能原因**：
- JavaScript 加载失败
- 路由配置错误
- 环境变量缺失

**解决步骤**：
1. 检查浏览器控制台是否有 JS 错误
2. 检查 Network 标签，查看资源加载情况
3. 确认 `EXPO_PUBLIC_BACKEND_BASE_URL` 已配置

### 问题 2: 404 页面

**可能原因**：
- vercel.json 路由重写配置错误
- 构建输出路径不正确

**解决步骤**：
1. 检查 `dist/` 目录是否存在
2. 检查 `dist/index.html` 是否存在
3. 验证 vercel.json 配置

### 问题 3: 后端连接失败

**可能原因**：
- 后端地址配置错误
- 后端未启动
- CORS 配置问题

**解决步骤**：
1. 确认后端地址正确
2. 测试后端是否可访问：`curl https://your-backend.railway.app/api/v1/health`
3. 检查后端 CORS 配置

### 问题 4: 资源加载失败

**可能原因**：
- 静态资源路径错误
- CDN 问题

**解决步骤**：
1. 检查 Network 标签，查看失败的资源
2. 确认资源路径是否正确
3. 清除浏览器缓存重试

---

## 📋 检查清单

部署前确认：

- [ ] `client/package.json` 包含 `"build": "expo export"`
- [ ] `client/vercel.json` 配置正确
- [ ] 环境变量 `EXPO_PUBLIC_BACKEND_BASE_URL` 已配置
- [ ] 后端服务正常运行
- [ ] 后端 CORS 配置允许 Vercel 域名
- [ ] 构建命令在本地可以成功执行

---

## 💡 快速修复命令

### 本地测试构建

```bash
cd client

# 清理之前的构建
rm -rf dist

# 测试构建
npm run build

# 检查构建输出
ls -la dist/
cat dist/index.html
```

### 本地测试静态服务

```bash
cd client/dist

# 安装 serve（如果未安装）
npm install -g serve

# 启动本地服务
serve -l 3000

# 访问 http://localhost:3000 测试
```

---

## 🔗 相关文档

- [Vercel 官方文档](https://vercel.com/docs)
- [Expo Web 部署指南](https://docs.expo.dev/deploy/web/)
- [Railway 部署指南](https://docs.railway.app/deploy/)

---

## 🆘 仍然无法解决？

请提供以下信息：

1. 浏览器控制台的完整错误信息
2. Vercel 部署日志的截图或复制内容
3. 具体的错误现象（白屏、404、500 等）
4. 访问的 URL

我可以帮你进一步排查问题。
