# Vercel 超时错误 (ERR_CONNECTION_TIMED_OUT) 排查指南

## 错误现象
```
无法访问此网站
english-translation-app.vercel.app 的响应时间过长。
ERR_CONNECTION_TIMED_OUT
```

---

## 🔍 快速诊断

### 诊断步骤 1：检查 Vercel 部署状态

1. 访问 Vercel 控制台：https://vercel.com/dashboard
2. 找到 `english-translation-app` 项目
3. 点击 **Deployments** 标签
4. 查看最新部署的状态：

| 状态图标 | 含义 | 操作 |
|---------|------|------|
| ✅ 绿色对勾 | 部署成功 | 继续下一步 |
| ⚠️ 黄色 | 部署警告 | 查看警告日志 |
| ❌ 红色 | 部署失败 | 查看错误日志 |
| 🔄 旋转 | 正在部署中 | 等待完成 |

**如果部署正在进行中**：
- 等待 2-3 分钟，部署通常需要 1-2 分钟完成
- 如果超过 5 分钟仍在进行，可能有问题

**如果部署失败**：
1. 点击部署记录查看详细日志
2. 复制错误信息
3. 根据错误类型修复（见下方"常见错误"）

---

### 诊断步骤 2：检查构建日志

1. 在部署记录页面，向下滚动查看 **Build Log**
2. 查找以下关键信息：

#### ✅ 成功的构建日志应该包含：
```
> build
> expo export

Starting Metro Bundler
...
Exported: dist
```

#### ❌ 失败的构建日志示例：

**错误 A：构建脚本未找到**
```
Error: Build script 'npm run build' not found in package.json
```
**解决**：确保 package.json 包含 `"build": "expo export"`

**错误 B：依赖安装失败**
```
Error: Cannot find module 'expo'
```
**解决**：检查 node_modules 是否正确安装

**错误 C：内存不足**
```
Build failed with exit code 137 (out of memory)
```
**解决**：等待一会儿后重试，或升级 Vercel 计划

**错误 D：TypeScript 错误**
```
error TS2307: Cannot find module 'xxx'
```
**解决**：修复代码中的类型错误

---

### 诊断步骤 3：检查生产环境部署

确保你访问的是 **Production** 环境，而不是 Preview 环境：

1. 在 Vercel 控制台，点击 **Domains** 标签
2. 查看你的生产域名：
   - 生产域名：`english-translation-app.vercel.app`
   - Preview 域名：`english-translation-app-xxx.vercel.app`

3. 确认你访问的是生产域名（没有 `-xxx` 后缀）

---

## 🔧 解决方案

### 方案 1：强制重新部署（推荐）

如果部署成功但仍然超时：

1. 进入 **Deployments** 标签
2. 找到最新的部署记录（绿色对勾）
3. 点击右侧的 `...` 菜单
4. 选择 **Redeploy**
5. ⚠️ **重要**：勾选 "Clear cache and re-deploy without using cache"
6. 点击 **Redeploy**
7. 等待 2-3 分钟后重试

---

### 方案 2：检查环境变量

环境变量配置错误可能导致应用无法启动：

1. 进入 **Settings** -> **Environment Variables**
2. 检查以下配置：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `EXPO_PUBLIC_BACKEND_BASE_URL` | `https://your-backend.railway.app` | Production, Preview, Development |

**验证后端地址**：
```bash
# 测试后端是否可访问
curl https://your-backend.railway.app/api/v1/health
```

如果后端返回正常，说明后端地址正确。

---

### 方案 3：检查网络连接

如果你在中国大陆：

**问题**：Vercel 在中国的访问可能不稳定

**解决方案**：

1. **使用 VPN**：
   - 连接到美国、日本或香港的 VPN
   - 然后访问 Vercel 域名

2. **使用国内 CDN 或镜像**：
   - 将域名托管到国内 CDN
   - 配置 DNS 解析到国内镜像

3. **使用国内替代服务**：
   - 考虑使用阿里云 OSS + CDN
   - 或使用其他国内服务

---

### 方案 4：使用 Preview 部署

如果生产部署有问题，先测试 Preview 部署：

1. 在 Vercel 控制台，进入 **Git** 标签
2. 找到你的 GitHub 仓库
3. 提交一个新的 commit
4. Vercel 会自动创建 Preview 部署
5. 等待 Preview 部署完成后访问预览链接

Preview 部署通常更快，且不会影响生产环境。

---

### 方案 5：检查浏览器和网络

1. **清除浏览器缓存**：
   - 按 `Ctrl + Shift + Delete`（Windows）
   - 或 `Cmd + Shift + Delete`（Mac）
   - 选择清除缓存和 Cookie
   - 刷新页面重试

2. **尝试不同浏览器**：
   - Chrome
   - Firefox
   - Edge
   - Safari

3. **尝试不同网络**：
   - 切换到手机热点
   - 尝试不同的 WiFi 网络

4. **检查代理和防火墙**：
   - 暂时关闭 VPN
   - 暂时关闭防火墙
   - 尝试直接访问

---

### 方案 6：使用 Vercel CLI 诊断

如果你有 Vercel CLI 访问权限：

```bash
# 安装 Vercel CLI（如果未安装）
npm i -g vercel

# 登录
vercel login

# 进入项目目录
cd english-translation-app/client

# 查看部署日志
vercel logs --prod

# 查看实时日志
vercel logs --prod --follow

# 重新部署
vercel --prod
```

---

## 📋 完整排查流程

按照以下顺序执行：

```
1. 检查 Vercel 部署状态
   ├─ 部署失败？→ 查看构建日志 → 修复错误
   ├─ 部署中？→ 等待完成
   └─ 部署成功？→ 继续下一步

2. 检查环境变量
   └─ 缺失或错误？→ 添加/修正 → 重新部署

3. 强制重新部署（清除缓存）
   └─ 等待 2-3 分钟

4. 尝试访问
   ├─ 成功？→ 完成
   └─ 仍然超时？→ 继续下一步

5. 检查网络连接
   ├─ 中国大陆？→ 使用 VPN
   ├─ 其他地区？→ 尝试不同网络
   └─ 仍然超时？→ 继续下一步

6. 使用 Preview 部署
   ├─ Preview 成功？→ 修复生产部署问题
   └─ Preview 也超时？→ 检查代码问题

7. 测试本地构建
   ├─ 本地成功？→ Vercel 配置问题
   └─ 本地失败？→ 修复代码问题
```

---

## 🚨 紧急恢复方案

如果 Vercel 一直无法访问，临时使用其他方式：

### 方案 A：使用本地静态服务器

```bash
cd client/dist

# 使用 serve
npx serve -l 3000

# 或使用 Python
python -m http.server 3000

# 访问 http://localhost:3000
```

### 方案 B：使用 GitHub Pages

1. 将 `client/dist` 目录推送到 `gh-pages` 分支
2. 在 GitHub 仓库设置中启用 GitHub Pages
3. 访问 `https://你的用户名.github.io/仓库名/`

### 方案 C：使用 Netlify

1. 访问 https://app.netlify.com
2. 连接 GitHub 仓库
3. 选择 `client` 目录
4. 配置构建命令：`npm run build`
5. 配置发布目录：`dist`
6. 部署

---

## 📞 获取帮助

如果以上方法都无法解决问题，请提供：

1. **Vercel 部署日志**：
   - 复制 Build Log 的完整内容

2. **你的地理位置**：
   - 中国大陆？
   - 其他地区？

3. **网络环境**：
   - 是否使用 VPN？
   - 使用的是哪个网络？

4. **Preview 部署状态**：
   - Preview 部署是否可以访问？

5. **本地测试结果**：
   - 本地 `npx serve` 是否可以访问？

---

## 🔗 相关链接

- [Vercel 状态页](https://www.vercel-status.com/) - 检查 Vercel 服务是否正常
- [Vercel 文档](https://vercel.com/docs)
- [Expo Web 部署指南](https://docs.expo.dev/deploy/web/)

---

**常见超时原因总结**：
1. 🌐 **网络问题**（中国大陆访问 Vercel 不稳定）- 最常见
2. 🔄 **部署仍在进行中** - 等待完成
3. 📦 **构建失败但未显示错误** - 查看详细日志
4. 🔧 **环境变量配置错误** - 检查配置
5. 💾 **Vercel 服务异常** - 检查状态页
