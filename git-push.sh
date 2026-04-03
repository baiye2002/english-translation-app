#!/bin/bash
# Git 推送脚本 - 在本地环境中使用

echo "=== 英语翻译应用 - GitHub 推送指南 ==="
echo ""

# 检查是否已安装 git
if ! command -v git &> /dev/null; then
    echo "❌ 错误：未检测到 Git，请先安装 Git"
    echo "   - macOS: brew install git"
    echo "   - Windows: 从 https://git-scm.com/ 下载安装"
    echo "   - Linux: sudo apt install git"
    exit 1
fi

echo "✅ Git 已安装"
echo ""

# 配置 Git 用户信息（如果未配置）
if [ -z "$(git config user.name)" ]; then
    echo "请输入你的 GitHub 用户名:"
    read username
    git config --global user.name "$username"
fi

if [ -z "$(git config user.email)" ]; then
    echo "请输入你的 GitHub 邮箱:"
    read email
    git config --global user.email "$email"
fi

echo ""
echo "当前 Git 配置:"
echo "  用户名: $(git config user.name)"
echo "  邮箱: $(git config user.email)"
echo ""

# 检查是否在 Git 仓库中
if [ ! -d ".git" ]; then
    echo "❌ 错误：当前目录不是 Git 仓库"
    echo "   请确保你在项目根目录中执行此脚本"
    exit 1
fi

# 检查远程仓库
if git remote get-url origin &> /dev/null; then
    echo "✅ 远程仓库已配置: $(git remote get-url origin)"
    read -p "是否要更新远程仓库地址? (y/N): " update_remote
    if [ "$update_remote" = "y" ] || [ "$update_remote" = "Y" ]; then
        echo "请输入新的远程仓库地址:"
        read remote_url
        git remote set-url origin "$remote_url"
        echo "✅ 远程仓库已更新"
    fi
else
    echo "📝 配置远程仓库"
    read -p "请输入 GitHub 仓库地址 (默认: https://github.com/baiye2002/english-translation-app.git): " remote_url
    remote_url=${remote_url:-https://github.com/baiye2002/english-translation-app.git}
    git remote add origin "$remote_url"
    echo "✅ 远程仓库已配置: $remote_url"
fi

echo ""
echo "🚀 准备推送代码到 GitHub..."
echo ""

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改:"
    git status --short
    echo ""
    read -p "是否要提交这些更改? (y/N): " commit_changes
    if [ "$commit_changes" = "y" ] || [ "$commit_changes" = "Y" ]; then
        echo "请输入提交信息:"
        read commit_message
        commit_message=${commit_message:-"feat: 更新项目"}
        git add .
        git commit -m "$commit_message"
        echo "✅ 更改已提交"
    else
        echo "❌ 取消推送"
        exit 1
    fi
fi

echo ""
echo "正在推送到 GitHub..."
echo "💡 首次推送可能需要认证，请输入 GitHub 用户名和密码（或 Personal Access Token）"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo "🔗 访问你的仓库: https://github.com/baiye2002/english-translation-app"
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "可能的原因:"
    echo "1. 认证失败 - 请检查用户名和密码（或使用 Personal Access Token）"
    echo "2. 网络问题 - 请检查网络连接"
    echo "3. 仓库权限问题 - 请确认你有推送权限"
    echo ""
    echo "解决方案:"
    echo "1. 使用 Personal Access Token: https://github.com/settings/tokens"
    echo "2. 使用 SSH 方式: git remote set-url origin git@github.com:baiye2002/english-translation-app.git"
fi
