# 🚀 快速开始：选择你的部署方案

## 3 分钟内做出选择

回答 3 个问题，立即找到最适合你的方案：

---

## Q1: 你有自定义域名吗？

### 有域名（例如：myapp.com）
**→ 继续回答 Q2**

### 没有域名
**→ 推荐方案：Cloudflare Pages（3分钟部署）**

**立即开始**：
1. 注册 Cloudflare：https://dash.cloudflare.com/sign-up
2. 连接你的 GitHub 仓库
3. 配置构建：`cd client && npm run build`
4. 访问：`https://english-translation-app.pages.dev`

**详细指南**：[DEPLOY_CLOUDFLARE_PAGES.md](./DEPLOY_CLOUDFLARE_PAGES.md)

---

## Q2（有域名）：你可以接受实名认证吗？

### 可以接受（提供身份证）
**→ 推荐方案：Gitee Pages（国内最快）**

**立即开始**：
1. 注册 Gitee：https://gitee.com/
2. 实名认证（身份证）
3. 导入 GitHub 仓库
4. 本地构建并推送到 gh-pages 分支
5. 访问：`https://你的用户名.gitee.io/english-translation-app`

**详细指南**：[DEPLOY_GITEE_PAGES.md](./DEPLOY_GITEE_PAGES.md)

### 不可以接受
**→ 推荐方案：Vercel + Cloudflare（最稳定）**

**立即开始**：
1. 注册 Cloudflare：https://dash.cloudflare.com/sign-up
2. 添加你的域名
3. 配置 DNS 指向 Vercel
4. 5 分钟后访问你的域名

**详细指南**：[DEPLOY_CLOUDFLARE.md](./DEPLOY_CLOUDFLARE.md)

---

## 📊 三大方案快速对比

| 方案 | 配置时间 | 需要 | 国内访问 | 费用 |
|------|----------|------|----------|------|
| **Cloudflare Pages** | 3 分钟 | 无 | ⭐⭐⭐⭐ | 免费 |
| **Gitee Pages** | 15 分钟 | 实名认证 | ⭐⭐⭐⭐⭐ | 免费 |
| **Vercel + Cloudflare** | 10 分钟 | 域名 | ⭐⭐⭐⭐⭐ | 域名费 |

---

## 🎯 我的最推荐

### 如果你在中国大陆
**首选：Cloudflare Pages**

**理由**：
- ✅ 配置最简单（3 分钟）
- ✅ 无需域名
- ✅ 无需实名认证
- ✅ 国内访问稳定
- ✅ 完全免费

---

### 如果你有域名
**首选：Vercel + Cloudflare**

**理由**：
- ✅ 访问速度最快
- ✅ 无限带宽
- ✅ 全球 CDN
- ✅ 专业级配置

---

## 🚀 立即行动

### 选项 A：Cloudflare Pages（推荐）

```bash
# 1. 访问 Cloudflare
https://dash.cloudflare.com/sign-up

# 2. 连接 GitHub
Workers & Pages -> Create application -> Pages -> Connect to Git

# 3. 配置构建
Project name: english-translation-app
Build command: cd client && npm run build
Build output directory: client/dist
Environment variables: EXPO_PUBLIC_BACKEND_BASE_URL

# 4. 部署
Save and Deploy

# 5. 访问
https://english-translation-app.pages.dev
```

**时间**：3-5 分钟

---

### 选项 B：Vercel + Cloudflare

```bash
# 1. 注册 Cloudflare
https://dash.cloudflare.com/sign-up

# 2. 添加域名
Add a Site -> 输入你的域名 -> Free

# 3. 配置 DNS
添加 CNAME 记录：
Type: CNAME
Name: www
Target: english-translation-app.vercel.app
Status: Proxied (橙色云朵)

# 4. 更新域名服务器
使用 Cloudflare 提供的 Nameserver 更新你的域名

# 5. 在 Vercel 添加自定义域名
Settings -> Domains -> Add Domain

# 6. 等待 DNS 生效
10-60 分钟

# 7. 访问
https://www.你的域名.com
```

**时间**：10-15 分钟（含 DNS 生效）

---

### 选项 C：Gitee Pages

```bash
# 1. 注册 Gitee
https://gitee.com/

# 2. 实名认证
设置 -> 账号管理 -> 实名认证

# 3. 导入 GitHub 仓库
从 GitHub / GitLab 导入仓库
输入：https://github.com/baiye2002/english-translation-app

# 4. 本地构建
cd client
rm -rf dist
npm run build

# 5. 创建 gh-pages 分支
cd /workspace/projects
git checkout -b gh-pages
rm -rf *
cp -r client/dist/* .
git add .
git commit -m "build: 更新 Gitee Pages"

# 6. 推送到 Gitee
git remote add gitee https://gitee.com/你的用户名/english-translation-app.git
git push gitee gh-pages:gh-pages

# 7. 启用 Gitee Pages
服务 -> Gitee Pages -> 启动 -> 选择 gh-pages 分支

# 8. 访问
https://你的用户名.gitee.io/english-translation-app
```

**时间**：15-20 分钟（含实名认证）

---

## 💡 需要帮助？

### 文档导航
- 📄 **所有方案对比**：[DEPLOY_COMPARISON.md](./DEPLOY_COMPARISON.md)
- 📄 **Cloudflare Pages 详细指南**：[DEPLOY_CLOUDFLARE_PAGES.md](./DEPLOY_CLOUDFLARE_PAGES.md)
- 📄 **Vercel + Cloudflare 详细指南**：[DEPLOY_CLOUDFLARE.md](./DEPLOY_CLOUDFLARE.md)
- 📄 **Gitee Pages 详细指南**：[DEPLOY_GITEE_PAGES.md](./DEPLOY_GITEE_PAGES.md)

### 常见问题

**Q: 哪个方案最简单？**
A: Cloudflare Pages，3 分钟即可完成部署。

**Q: 哪个方案访问最快？**
A: Gitee Pages 在中国大陆访问最快。

**Q: 哪个方案最稳定？**
A: Vercel + Cloudflare，全球 CDN 加速。

**Q: 需要花钱吗？**
A: 这三个方案都是免费的，Vercel + Cloudflare 需要购买域名（约 60-100 元/年）。

---

## 🎉 开始吧！

选择最适合你的方案，参考对应文档，3-20 分钟内即可完成部署！

**我的推荐**：如果你在中国大陆，直接选择 **Cloudflare Pages**（方案 2），3 分钟搞定！🚀
