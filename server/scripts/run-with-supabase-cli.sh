#!/bin/bash

# ========================================
# 使用 Supabase CLI 执行 SQL
# ========================================

SQL_FILE="/workspace/projects/server/FULL_DATABASE_EXPORT.sql"
SUPABASE_URL="https://eknfiycdhykfcdldnwbj.supabase.co"
SUPABASE_ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbmZpeWNkaHlrZmNkbGRud2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxODM3MiwiZXhwIjoyMDkwNzk0MzcyfQ.0C4owyPmyH7Fr3MzHVW5vwISyBlzyGuLt3cwfxPk4Sw"

echo "===================================="
echo "使用 Supabase CLI 执行 SQL"
echo "===================================="
echo ""

# 检查 Supabase CLI 是否安装
if ! command -v supabase &> /dev/null; then
    echo "❌ 错误：Supabase CLI 未安装"
    echo ""
    echo "请先安装 Supabase CLI："
    echo "npm install -g supabase"
    exit 1
fi

echo "✓ Supabase CLI 已安装"
echo ""

# 检查 SQL 文件是否存在
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ 错误：SQL 文件不存在"
    echo "文件路径: $SQL_FILE"
    exit 1
fi

echo "✓ SQL 文件存在"
echo "文件大小: $(du -h "$SQL_FILE" | cut -f1)"
echo ""

# 设置环境变量
export SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN"

# 尝试执行 SQL
echo "===================================="
echo "开始执行 SQL..."
echo "===================================="
echo ""

# 使用 Supabase API 执行 SQL
# 注意：这需要项目已链接到 Supabase CLI
supabase db execute --file "$SQL_FILE" --project-url "$SUPABASE_URL"

if [ $? -eq 0 ]; then
    echo ""
    echo "===================================="
    echo "✅✅✅ SQL 执行成功！"
    echo "===================================="
    echo ""
    echo "下一步操作："
    echo "1. 在 Railway 控制台点击 'Redeploy' 按钮重新部署服务"
    echo "2. 等待部署完成后，测试前端获取题目和提示功能"
else
    echo ""
    echo "===================================="
    echo "❌ SQL 执行失败！"
    echo "===================================="
    echo ""
    echo "尝试使用 psql 直接连接数据库..."
fi
