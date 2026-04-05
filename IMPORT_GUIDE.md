# 完整数据导入指南

## 📊 数据统计

已成功导出所有开发环境数据：

| 数据表 | 记录数 | 说明 |
|--------|--------|------|
| questions | 2068 | 题目（13 个年级） |
| question_hints | 1000 | 题目提示 |
| practice_sessions | 9 | 练习会话 |
| practice_answers | 50 | 练习答案 |
| competition_rooms | 66 | 竞赛房间 |
| competition_players | 72 | 竞赛玩家 |
| competition_answers | 36 | 竞赛答案 |
| health_check | - | 健康检查（无权限） |

**总计：约 3300 条记录**

---

## 🚀 导入步骤

### 步骤 1：获取 Supabase 配置

从 Railway 获取 Supabase 配置：

1. 登录 [Railway](https://railway.app)
2. 进入你的后端项目
3. 点击 **Variables** 标签
4. 复制以下变量：
   - `COZE_SUPABASE_URL`
   - `COZE_SUPABASE_ANON_KEY`

### 步骤 2：登录 Supabase

1. 访问 https://supabase.com/dashboard
2. 找到你的 Supabase 项目
   - URL 格式：`https://xxx.supabase.co`
   - 在 Supabase Dashboard 中，URL 在 **Settings** → **API** 中

### 步骤 3：创建表结构

1. 在 Supabase Dashboard 中，点击 **SQL Editor**
2. 点击 **New Query**
3. 复制 `/workspace/projects/DATABASE_INIT.sql` 的内容
4. 粘贴并点击 **Run**

**预期结果**：创建 7 个表 + 索引 + RLS 策略

### 步骤 4：导入所有数据

1. 点击 **New Query**
2. 复制 `/workspace/projects/DATABASE_ALL_DATA.sql` 的内容（6672 行）
3. 粘贴并点击 **Run**

**导入时间**：约 2-5 分钟（取决于网络速度）

---

## ✅ 验证导入

### 验证表结构

在 SQL Editor 中执行：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**预期结果**：
```
table_name
------------------
competition_answers
competition_players
competition_rooms
practice_answers
practice_sessions
questions
question_hints
```

### 验证题目数量

```sql
SELECT
  difficulty AS '难度级别',
  COUNT(*) AS '题目数量'
FROM questions
GROUP BY difficulty
ORDER BY
  CASE difficulty
    WHEN '小学一年级' THEN 1
    WHEN '小学二年级' THEN 2
    WHEN '小学三年级' THEN 3
    WHEN '小学四年级' THEN 4
    WHEN '小学五年级' THEN 5
    WHEN '小学六年级' THEN 6
    WHEN '初中一年级' THEN 7
    WHEN '初中二年级' THEN 8
    WHEN '初中三年级' THEN 9
    WHEN '高中一年级' THEN 10
    WHEN '高中二年级' THEN 11
    WHEN '高中三年级' THEN 12
    WHEN '大学' THEN 13
  END;
```

**预期结果**：
```
difficulty | count
-----------|------
小学一年级 | 186
小学二年级 | 102
小学三年级 | 244
小学四年级 | 162
小学五年级 | 155
小学六年级 | 145
初中一年级 | 222
初中二年级 | 119
初中三年级 | 152
高中一年级 | 144
高中二年级 | 132
高中三年级 | 143
大学       | 162
```

### 验证其他数据

```sql
-- 查看题目提示数量
SELECT COUNT(*) FROM question_hints;

-- 查看练习会话数量
SELECT COUNT(*) FROM practice_sessions;

-- 查看竞赛房间数量
SELECT COUNT(*) FROM competition_rooms;
```

---

## 🧪 测试 API

### 测试获取题目

```bash
curl "https://server-production-74b7.up.railway.app/api/v1/practice/questions/小学四年级"
```

**预期返回**：
```json
{
  "questions": [
    {
      "id": 1,
      "chineseSentence": "..."
    },
    ...
  ]
}
```

### 测试获取提示

```bash
curl "https://server-production-74b7.up.railway.app/api/v1/practice/hint/1?difficulty=小学四年级"
```

**预期返回**：
```json
{
  "hint": "..."
}
```

---

## 📝 文件说明

| 文件 | 说明 | 行数 |
|------|------|------|
| DATABASE_INIT.sql | 创建表结构 | ~200 行 |
| DATABASE_ALL_DATA.sql | 所有数据（包括题目） | 6672 行 |
| DATABASE_EXPORT.sql | 仅题目数据 | 4166 行 |

---

## ⚠️ 注意事项

### 1. 导入顺序
必须先执行 `DATABASE_INIT.sql` 创建表，再执行 `DATABASE_ALL_DATA.sql` 导入数据。

### 2. 重复导入
如果需要重新导入，先清空表：

```sql
TRUNCATE TABLE practice_answers CASCADE;
TRUNCATE TABLE practice_sessions CASCADE;
TRUNCATE TABLE competition_answers CASCADE;
TRUNCATE TABLE competition_players CASCADE;
TRUNCATE TABLE competition_rooms CASCADE;
TRUNCATE TABLE question_hints CASCADE;
DELETE FROM questions;
```

### 3. 权限问题
如果遇到权限错误，检查 RLS 策略是否正确配置。

### 4. 导入时间
完整导入可能需要 2-5 分钟，请耐心等待。

---

## 🔧 故障排除

### 问题 1：表已存在
**错误**：`relation "questions" already exists`

**解决**：先清空或删除表，重新执行 `DATABASE_INIT.sql`

### 问题 2：外键约束失败
**错误**：`insert or update on table violates foreign key constraint`

**解决**：确保按照 SQL 文件中的顺序导入（先 questions，再 hints，再其他表）

### 问题 3：权限被拒绝
**错误**：`permission denied for table xxx`

**解决**：检查 RLS 策略，确保允许所有操作

---

## 🎯 导入完成后的下一步

1. 测试后端 API 是否正常
2. 测试前端是否可以正常连接后端
3. 解决前端麦克风权限问题
4. 完整测试应用功能

---

## 📞 获取帮助

如果遇到问题，请提供：
1. 错误信息（完整堆栈）
2. 执行的 SQL 语句
3. Supabase 项目 URL（脱敏）
4. Railway 变量配置（脱敏）
