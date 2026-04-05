# 方案 3：Gitee Pages（国内免费）

## 🎯 方案概述

Gitee Pages 是 Gitee（中国版 GitHub）提供的静态网站托管服务，完全免费，在中国大陆访问速度最快。

**优势**：
- ✅ 完全免费
- ✅ 中国大陆访问速度最快
- ✅ 无需翻墙
- ✅ 支持 HTTPS

**限制**：
- ⚠️ 仅支持静态网站
- ⚠️ 需要实名认证
- ⚠️ 构建限制（50MB）
- ⚠️ 部署限制（手动触发）
- ⚠️ 可能需要审核

---

## 📋 前置条件

- Gitee 账号（免费）
- 实名认证（身份证）

---

## 🚀 配置步骤

### 步骤 1：注册 Gitee 账号（2分钟）

1. 访问：https://gitee.com/
2. 点击右上角 **注册**
3. 使用手机号或邮箱注册
4. 完成 Email 验证

---

### 步骤 2：实名认证（5分钟）

1. 登录 Gitee
2. 点击右上角头像 -> **设置**
3. 左侧菜单 -> **账号管理** -> **实名认证**
4. 输入真实姓名和身份证号
5. 扫描二维码人脸识别
6. 等待审核（通常 5-10 分钟）

---

### 步骤 3：导入 GitHub 仓库（3分钟）

#### 方式 A：导入现有仓库

1. 点击右上角 **+** -> **从 GitHub / GitLab 导入仓库**
2. 输入 GitHub 仓库地址：`https://github.com/baiye2002/english-translation-app`
3. 点击 **导入**
4. 等待导入完成

#### 方式 B：创建新仓库并推送

1. 点击右上角 **+** -> **新建仓库**
2. 仓库名：`english-translation-app`
3. 设置为公开
4. 点击 **创建**

然后在本地执行：
```bash
cd english-translation-app

# 添加 Gitee 远程仓库
git remote add gitee https://gitee.com/你的用户名/english-translation-app.git

# 推送到 Gitee
git push gitee main
```

---

### 步骤 4：本地构建并推送（2分钟）

#### 4.1 构建项目

```bash
cd client

# 清理旧的构建
rm -rf dist

# 构建项目
npm run build
```

#### 4.2 创建 gh-pages 分支

Gitee Pages 需要将构建产物放在单独的分支（通常为 gh-pages）。

```bash
cd /workspace/projects

# 创建并切换到 gh-pages 分支
git checkout -b gh-pages

# 复制构建产物
rm -rf *
cp -r client/dist/* .

# 添加并提交
git add .
git commit -m "build: 更新 Gitee Pages"

# 推送到 Gitee（注意：推送到 gitee 远程仓库）
git push gitee gh-pages:gh-pages
```

---

### 步骤 5：启用 Gitee Pages（1分钟）

1. 访问 Gitee 仓库页面
2. 点击 **服务** -> **Gitee Pages**
3. 选择分支：`gh-pages`
4. 点击 **启动**
5. 等待部署（通常 1-2 分钟）

---

### 步骤 6：访问网站

部署成功后：
1. Gitee 会提供访问地址：`https://你的用户名.gitee.io/english-translation-app`
2. 访问该域名测试

---

## 🔧 配置自定义域名（可选）

### 步骤 1：添加域名

1. 在 Gitee Pages 设置页面
2. 点击 **自定义域名**
3. 输入你的域名（例如：`english-translation.com`）
4. 点击 **验证**

### 步骤 2：配置 DNS

在你的域名注册商（阿里云/腾讯云）添加 CNAME 记录：

| 类型 | 名称 | 内容 |
|------|------|------|
| CNAME | @ | `你的用户名.gitee.io` |

### 步骤 3：配置 HTTPS

1. Gitee 会自动为你申请 SSL 证书
2. 等待证书签发（通常 10-30 分钟）
3. 开启强制 HTTPS

---

## 🔄 自动化部署（可选）

由于 Gitee Pages 不支持自动部署，可以使用 GitHub Actions 自动构建并推送到 Gitee。

### 创建 GitHub Actions 配置文件

在项目中创建 `.github/workflows/deploy-gitee.yml`：

```yaml
name: Deploy to Gitee Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: |
          cd client
          pnpm install

      - name: Build
        run: |
          cd client
          pnpm run build

      - name: Deploy to Gitee
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITEE_TOKEN }}
          publish_dir: ./client/dist
          external_repository: 你的Gitee用户名/english-translation-app
          publish_branch: gh-pages
```

### 配置 Secrets

在 GitHub 仓库设置中添加：
- `GITEE_TOKEN`: 你的 Gitee Personal Access Token

**生成 Gitee Token**：
1. Gitee -> 设置 -> 私人令牌
2. 生成新令牌，勾选 `projects` 权限

---

## ⚠️ 注意事项

### 1. 实名认证

- 必须完成实名认证才能使用 Gitee Pages
- 需要身份证信息

### 2. 构建限制

- 单次构建不能超过 50MB
- 建议优化构建产物大小

### 3. 手动部署

- 默认需要手动触发部署
- 可以使用 GitHub Actions 自动化

### 4. 审核限制

- 部署可能需要审核
- 通常 5-10 分钟内完成

### 5. HTTPS

- 默认支持 HTTPS
- 自定义域名需要配置 SSL

---

## 🎉 完成后

配置完成后：
1. 访问：`https://你的用户名.gitee.io/english-translation-app`
2. 在中国大陆访问速度最快
3. 无需翻墙

---

## 🆘 故障排查

### 问题 1：部署失败

**可能原因**：
- 构建产物超过 50MB
- 实名认证未完成
- 内容违规

**解决**：
1. 优化构建产物大小
2. 完成实名认证
3. 检查内容是否合规

### 问题 2：访问 404

**可能原因**：
- 分支选择错误
- 部署未完成

**解决**：
1. 确认选择了正确的分支（gh-pages）
2. 等待部署完成
3. 检查构建产物是否正确

### 问题 3：自定义域名无法访问

**可能原因**：
- DNS 配置错误
- 证书未签发

**解决**：
1. 检查 DNS 记录是否正确
2. 等待 SSL 证书签发
3. 清除浏览器缓存

---

## 📞 资源链接

- Gitee Pages 文档：https://pages.gitee.com/
- Gitee Pages 使用指南：https://gitee.com/help/articles/4136

---

## 🆚 三种方案对比

| 特性 | Vercel + Cloudflare | Cloudflare Pages | Gitee Pages |
|------|---------------------|------------------|-------------|
| 免费 | ✅ | ✅ | ✅ |
| 国内访问速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 需要域名 | ✅ | ❌ | ❌ |
| 实名认证 | ❌ | ❌ | ✅ |
| 自动部署 | ✅ | ✅ | ❌（需配置） |
| 自定义域名 | ✅ | ✅ | ✅ |
| 带宽 | 100GB/月 | 无限 | 无限 |
| 部署次数 | 无限 | 500次/月 | 无限制 |

---

## 🎯 推荐方案

### 1. 如果你有域名
**推荐**：Vercel + Cloudflare
- 访问速度最快
- 配置简单
- 自动部署

### 2. 如果你没有域名
**推荐**：Cloudflare Pages
- 完全免费
- 配置简单
- 自动部署

### 3. 如果你在国内且不想用域名
**推荐**：Gitee Pages
- 国内访问最快
- 完全免费
- 需要实名认证

---

**我的推荐**：如果你在中国大陆，优先选择 **Cloudflare Pages**（方案 2），因为：
- ✅ 无需自定义域名
- ✅ 无需实名认证
- ✅ 国内访问相对稳定
- ✅ 配置简单
- ✅ 完全免费
