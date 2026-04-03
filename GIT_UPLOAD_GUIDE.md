# Git 上传到 GitHub 指南

## 当前状态

项目已经初始化了 Git 仓库，在 main 分支上，工作区是干净的。

## 上传步骤

### 1. 在 GitHub 上创建仓库

1. 登录 GitHub
2. 点击右上角 `+` -> `New repository`
3. 填写仓库信息：
   - Repository name: `english-translation-app`（建议）
   - Description: 英语翻译学习应用 - 支持 AI 评判与多人竞技
   - 选择 Public 或 Private
   - **不要勾选** "Add a README file"
   - **不要勾选** "Add .gitignore"
4. 点击 `Create repository`

### 2. 连接远程仓库并推送

创建仓库后，GitHub 会显示仓库地址，格式如下：
```
https://github.com/你的用户名/仓库名.git
```

然后在项目根目录执行：

```bash
cd /workspace/projects

# 添加远程仓库（替换成你的实际仓库地址）
git remote add origin https://github.com/你的用户名/仓库名.git

# 验证远程仓库
git remote -v

# 推送到 GitHub
git push -u origin main
```

### 3. 验证上传成功

推送完成后，刷新 GitHub 仓库页面，应该能看到所有项目文件。

---

## 注意事项

1. **首次推送可能需要认证**：
   - 使用 HTTPS 方式可能需要输入 GitHub 用户名和密码（或 Personal Access Token）
   - 建议使用 SSH 方式：`git remote add origin git@github.com:你的用户名/仓库名.git`

2. **分支保护**：
   - 如果 GitHub 仓库设置了分支保护规则，可能需要创建 PR 而不是直接推送

3. **敏感信息**：
   - 确保 `.gitignore` 已正确配置，避免上传敏感文件（如 .env 文件）
   - 检查 `.coze` 和 `.cozeproj` 目录（这些是系统配置文件，应保留）

---

## 如果遇到问题

### 问题：认证失败

**解决方案 1 - 使用 Personal Access Token**：
1. GitHub Settings -> Developer settings -> Personal access tokens -> Tokens (classic)
2. 生成新 token，勾选 `repo` 权限
3. 使用 token 替代密码

**解决方案 2 - 使用 SSH**：
```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 在 GitHub 上添加 SSH 密钥：Settings -> SSH and GPG keys -> New SSH key

# 使用 SSH 地址
git remote set-url origin git@github.com:你的用户名/仓库名.git

# 推送
git push -u origin main
```

### 问题：推送被拒绝

```bash
# 强制推送（谨慎使用，会覆盖远程更改）
git push -u origin main --force
```

---

## 后续操作

上传成功后，可以：

1. **设置 GitHub Pages**（用于 Web 版前端托管）：
   - Settings -> Pages -> Source 选择 `GitHub Actions`

2. **配置自动部署**：
   - Railway: 连接 GitHub 仓库，自动部署后端
   - Vercel: 连接 GitHub 仓库，自动部署前端

3. **设置 CI/CD**：
   - 在仓库根目录创建 `.github/workflows` 目录
   - 添加 GitHub Actions 配置文件，实现自动测试和部署
