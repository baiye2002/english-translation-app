#!/bin/bash
# Vercel 连接测试脚本

echo "========================================"
echo "  Vercel 连接诊断工具"
echo "========================================"
echo ""

# 测试的 Vercel 域名
VERCEL_DOMAIN="english-translation-app.vercel.app"

echo "🔍 正在诊断: $VERCEL_DOMAIN"
echo ""

# 测试 1: DNS 解析
echo "测试 1: DNS 解析"
echo "----------------------------------------"
if command -v nslookup &> /dev/null; then
    nslookup $VERCEL_DOMAIN 2>&1 | head -5
elif command -v dig &> /dev/null; then
    dig $VERCEL_DOMAIN +short
else
    echo "⚠️  未找到 nslookup 或 dig 命令"
    echo "   请手动测试: ping $VERCEL_DOMAIN"
fi
echo ""

# 测试 2: 网络连接
echo "测试 2: 网络连接 (curl)"
echo "----------------------------------------"
if command -v curl &> /dev/null; then
    echo "正在测试连接（30秒超时）..."
    if curl -I --connect-timeout 30 --max-time 30 https://$VERCEL_DOMAIN 2>&1 | grep -E "HTTP|Connection|timed out"; then
        echo "✅ 连接成功"
    else
        echo "❌ 连接失败"
        echo ""
        echo "尝试 ping 测试..."
        ping -c 3 $VERCEL_DOMAIN 2>&1 | tail -3
    fi
else
    echo "⚠️  未找到 curl 命令"
    echo "   使用 ping 测试..."
    ping -c 3 $VERCEL_DOMAIN 2>&1 | tail -3
fi
echo ""

# 测试 3: 检查本地网络
echo "测试 3: 检查本地网络"
echo "----------------------------------------"
echo "测试访问其他网站..."

if command -v curl &> /dev/null; then
    if curl -I --connect-timeout 10 https://www.google.com > /dev/null 2>&1; then
        echo "✅ Google - 可访问"
    else
        echo "❌ Google - 不可访问"
    fi

    if curl -I --connect-timeout 10 https://www.baidu.com > /dev/null 2>&1; then
        echo "✅ 百度 - 可访问"
    else
        echo "❌ 百度 - 不可访问"
    fi

    if curl -I --connect-timeout 10 https://vercel.com > /dev/null 2>&1; then
        echo "✅ Vercel 官网 - 可访问"
    else
        echo "❌ Vercel 官网 - 不可访问"
    fi
fi
echo ""

# 测试 4: 检查 Vercel 状态
echo "测试 4: Vercel 服务状态"
echo "----------------------------------------"
echo "正在检查 Vercel 状态页..."
if command -v curl &> /dev/null; then
    curl -s https://www.vercel-status.com/ | grep -o 'All Systems Operational\|Degraded Performance\|Partial Outage\|Major Outage' | head -1
else
    echo "请手动访问: https://www.vercel-status.com/"
fi
echo ""

# 诊断总结
echo "========================================"
echo "  诊断总结"
echo "========================================"
echo ""
echo "如果所有测试都失败，可能是以下原因："
echo ""
echo "1. 🌐 网络问题"
echo "   - 检查网络连接"
echo "   - 尝试切换网络（WiFi/手机热点）"
echo "   - 如果你在中国大陆，尝试使用 VPN"
echo ""
echo "2. 🔒 防火墙/代理问题"
echo "   - 暂时关闭防火墙"
echo "   - 暂时关闭 VPN 或代理"
echo "   - 尝试使用不同的浏览器"
echo ""
echo "3. 🌍 地理位置限制"
echo "   - Vercel 在某些地区可能访问缓慢"
echo "   - 尝试从不同网络访问"
echo ""
echo "4. 📦 Vercel 服务问题"
echo "   - 检查 Vercel 状态页: https://www.vercel-status.com/"
echo "   - 等待服务恢复"
echo ""
echo "5. 🔧 部署问题"
echo "   - 检查 Vercel 控制台中的部署状态"
echo "   - 查看部署日志是否有错误"
echo "   - 尝试强制重新部署（清除缓存）"
echo ""
echo "========================================"
echo "  下一步操作"
echo "========================================"
echo ""
echo "1. 访问 Vercel 控制台检查部署状态:"
echo "   https://vercel.com/dashboard"
echo ""
echo "2. 查看详细的故障排查指南:"
echo "   VERCEL_TIMEOUT_FIX.md"
echo ""
echo "3. 如果在中国大陆，建议:"
echo "   - 使用 VPN 连接到美国、日本或香港"
echo "   - 或考虑使用国内托管服务"
echo ""
