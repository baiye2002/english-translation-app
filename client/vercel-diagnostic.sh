#!/bin/bash
# Vercel 部署诊断脚本

echo "========================================"
echo "  Vercel 部署诊断工具"
echo "========================================"
echo ""

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：当前目录不是有效的项目目录"
    echo "   请在 client 目录中运行此脚本"
    exit 1
fi

echo "✅ 当前目录: $(pwd)"
echo ""

# 检查构建命令
echo "📋 检查 package.json 配置..."
if grep -q '"build"' package.json; then
    echo "✅ 构建命令已配置: $(grep -A 1 '"build"' package.json | tail -1 | cut -d'"' -f4)"
else
    echo "❌ 错误：未找到构建命令"
    echo "   需要在 package.json 的 scripts 中添加 'build' 命令"
fi

if grep -q '"export"' package.json; then
    echo "✅ 导出命令已配置"
else
    echo "⚠️  警告：未找到导出命令"
fi
echo ""

# 检查配置文件
echo "📋 检查配置文件..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json 存在"
    echo "   内容:"
    cat vercel.json
else
    echo "❌ 错误：未找到 vercel.json"
fi

if [ -f ".vercelignore" ]; then
    echo "✅ .vercelignore 存在"
else
    echo "⚠️  警告：未找到 .vercelignore"
fi

if [ -f "app.config.ts" ]; then
    echo "✅ app.config.ts 存在"
else
    echo "❌ 错误：未找到 app.config.ts"
fi
echo ""

# 检查依赖
echo "📋 检查依赖安装..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules 目录存在"
    module_count=$(find node_modules -maxdepth 1 -mindepth 1 -type d | wc -l)
    echo "   已安装 $module_count 个依赖包"
else
    echo "❌ 错误：未安装依赖"
    echo "   请运行: pnpm install"
fi
echo ""

# 检查构建输出
echo "📋 检查构建输出..."
if [ -d "dist" ]; then
    echo "✅ dist 目录存在"
    if [ -f "dist/index.html" ]; then
        echo "✅ dist/index.html 存在"
        size=$(du -h dist/index.html | cut -f1)
        echo "   文件大小: $size"
    else
        echo "❌ 错误：未找到 dist/index.html"
    fi

    if [ -d "dist/_expo" ]; then
        echo "✅ dist/_expo 目录存在"
    else
        echo "⚠️  警告：未找到 dist/_expo 目录"
    fi

    if [ -d "dist/assets" ]; then
        echo "✅ dist/assets 目录存在"
    else
        echo "⚠️  警告：未找到 dist/assets 目录"
    fi
else
    echo "⚠️  警告：未找到 dist 目录（需要先构建）"
fi
echo ""

# 测试构建
echo "========================================"
echo "  是否要执行测试构建？"
echo "========================================"
read -p "执行测试构建？这需要几分钟时间 (y/N): " do_build

if [ "$do_build" = "y" ] || [ "$do_build" = "Y" ]; then
    echo ""
    echo "🔨 开始构建..."
    echo ""

    # 清理旧的构建
    if [ -d "dist" ]; then
        echo "清理旧的构建输出..."
        rm -rf dist
    fi

    # 执行构建
    if npm run build; then
        echo ""
        echo "✅ 构建成功！"
        echo ""
        echo "📦 构建输出:"
        du -sh dist/*
        echo ""

        # 测试静态服务
        echo "========================================"
        echo "  是否要启动本地服务测试？"
        echo "========================================"
        read -p "启动本地服务？(y/N): " start_server

        if [ "$start_server" = "y" ] || [ "$start_server" = "Y" ]; then
            if command -v serve &> /dev/null; then
                echo ""
                echo "🚀 启动本地服务: http://localhost:3000"
                echo "按 Ctrl+C 停止服务"
                echo ""
                cd dist && serve -l 3000
            else
                echo ""
                echo "❌ 未找到 serve 命令"
                echo "   安装: npm install -g serve"
            fi
        fi
    else
        echo ""
        echo "❌ 构建失败"
        echo "   请检查错误信息并修复问题"
        exit 1
    fi
else
    echo "跳过构建测试"
fi

echo ""
echo "========================================"
echo "  诊断完成"
echo "========================================"
echo ""
echo "如果所有检查都通过，但 Vercel 仍然无法访问："
echo "1. 检查 Vercel 部署日志"
echo "2. 确认环境变量已配置（EXPO_PUBLIC_BACKEND_BASE_URL）"
echo "3. 在 Vercel 控制台中执行 Redeploy（清除缓存）"
echo "4. 检查浏览器控制台错误信息"
echo ""
echo "详细排查指南请参考: VERCEL_TROUBLESHOOTING.md"
