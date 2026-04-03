# 如何将项目上传到 GitHub（本地环境操作指南）

## 🎯 目标
将沙箱中开发的项目上传到 GitHub 仓库：https://github.com/baiye2002/english-translation-app

---

## 📦 方案一：推荐 - 使用 Git 拉取后推送

### 步骤 1：在你的电脑上克隆项目

打开终端（Terminal / CMD / PowerShell），执行：

```bash
# 克隆空仓库
git clone https://github.com/baiye2002/english-translation-app.git
cd english-translation-app
```

### 步骤 2：下载项目文件

由于你在沙箱环境中开发，你需要将项目文件导出到本地。有几种方式：

#### 方式 A：如果沙箱支持文件导出
1. 在沙箱文件管理器中找到 `/workspace/projects` 目录
2. 将所有文件打包下载（zip 格式）
3. 解压到你的本地 `english-translation-app` 目录

#### 方式 B：使用 Git 导出（推荐）

在沙箱环境中执行：

```bash
cd /workspace/projects

# 导出项目（排除 Git 历史和 node_modules）
git archive --format zip --output /tmp/english-translation-app.zip HEAD

# 将 zip 文件传输到本地（通过文件管理器下载或使用其他方式）
```

然后在本地解压覆盖到 `english-translation-app` 目录。

### 步骤 3：在本地提交并推送

```bash
cd english-translation-app

# 查看状态
git status

# 添加所有文件
git add .

# 提交
git commit -m "feat: 初始化英语翻译学习应用"

# 推送到 GitHub
git push -u origin main
```

---

## 📦 方案二：使用导出的项目文件

### 步骤 1：导出项目

在沙箱环境中执行：

```bash
cd /workspace/projects

# 创建导出目录
mkdir -p /tmp/export

# 复制项目文件（排除 node_modules 和构建产物）
rsync -av --exclude='node_modules' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.expo' \
  --exclude='.git' \
  . /tmp/export/

# 打包
cd /tmp
zip -r english-translation-app.zip export/
```

然后下载 `/tmp/english-translation-app.zip` 到你的电脑。

### 步骤 2：在本地初始化 Git

```bash
# 解压项目
unzip english-translation-app.zip
cd export

# 初始化 Git
git init
git add .
git commit -m "feat: 初始化英语翻译学习应用"

# 添加远程仓库
git remote add origin https://github.com/baiye2002/english-translation-app.git

# 推送
git push -u origin main
```

---

## 🔐 GitHub 认证配置

### 方法 1：使用 Personal Access Token（推荐）

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选以下权限：
   - `repo`（完整仓库访问权限）
   - `workflow`（如需配置 GitHub Actions）
4. 点击 "Generate token"
5. 复制生成的 token（只显示一次）

在推送时，使用 token 作为密码：
- 用户名：你的 GitHub 用户名
- 密码：Personal Access Token

### 方法 2：配置 SSH（推荐给高级用户）

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 添加到 GitHub：
# Settings -> SSH and GPG keys -> New SSH key
# 粘贴公钥内容

# 切换到 SSH 地址
git remote set-url origin git@github.com:baiye2002/english-translation-app.git

# 测试连接
ssh -T git@github.com

# 推送
git push -u origin main
```

---

## 🚀 一键推送脚本

如果你已经将项目文件下载到本地，可以使用项目根目录的 `git-push.sh` 脚本：

```bash
# 进入项目目录
cd english-translation-app

# 给脚本添加执行权限（macOS/Linux）
chmod +x git-push.sh

# 运行脚本
./git-push.sh
```

脚本会自动：
- 检查 Git 配置
- 配置远程仓库
- 检查未提交的更改
- 执行推送操作

---

## ✅ 验证上传成功

推送完成后，访问 https://github.com/baiye2002/english-translation-app，你应该能看到：

- 📁 完整的项目文件结构
- 📄 README.md 文件
- 🔧 配置文件（.gitignore, package.json 等）

---

## 🎉 后续操作

上传成功后，你可以：

1. **配置 GitHub Pages**（用于 Web 版前端托管）
2. **连接到 Railway**（自动部署后端）
3. **连接到 Vercel**（自动部署前端）
4. **设置 CI/CD**（自动测试和部署）

详细部署步骤请参考：`DEPLOY_WEB.md`
