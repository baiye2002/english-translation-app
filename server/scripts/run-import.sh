#!/bin/bash

# ========================================
# 直接连接 Supabase 数据库并执行 SQL
# ========================================

# 数据库连接信息
DB_HOST="db.eknfiycdhykfcdldnwbj.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbmZpeWNkaHlrZmNkbGRud2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxODM3MiwiZXhwIjoyMDkwNzk0MzcyfQ.0C4owyPmyH7Fr3MzHVW5vwISyBlzyGuLt3cwfxPk4Sw"

SQL_FILE="/workspace/projects/server/FULL_DATABASE_EXPORT.sql"

echo "===================================="
echo "开始执行数据库导入..."
echo "===================================="
echo ""

# 检查 psql 是否安装
if ! command -v psql &> /dev/null; then
    echo "❌ 错误：psql 未安装"
    echo ""
    echo "请先安装 PostgreSQL 客户端："
    echo "Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "macOS: brew install postgresql"
    echo "Windows: 从 https://www.postgresql.org/download/ 下载"
    exit 1
fi

echo "✓ psql 已安装"
echo ""

# 检查 SQL 文件是否存在
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ 错误：SQL 文件不存在"
    echo "文件路径: $SQL_FILE"
    exit 1
fi

echo "✓ SQL 文件存在"
echo "文件大小: $(du -h "$SQL_FILE" | cut -f1)"
echo "行数: $(wc -l < "$SQL_FILE")"
echo ""

# 执行 SQL
echo "===================================="
echo "开始执行 SQL..."
echo "===================================="
echo ""

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"

# 检查执行结果
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
    exit 1
fi
