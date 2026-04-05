-- 英语翻译学习应用 - 题目数据扩充脚本
-- 为每个年级添加更多题目，确保每个年级至少 50 道
-- 在 Supabase SQL Editor 中执行

-- ========================================
-- 小学一年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('那是我的朋友', 'That is my friend', '小学一年级'),
  ('她是一名老师', 'She is a teacher', '小学一年级'),
  ('这是我的学校', 'This is my school', '小学一年级'),
  ('我有一只狗', 'I have a dog', '小学一年级'),
  ('我喜欢画画', 'I like drawing', '小学一年级');

-- ========================================
-- 小学二年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我会数到十', 'I can count to ten', '小学二年级'),
  ('她喜欢吃苹果', 'She likes eating apples', '小学二年级'),
  ('我们有一个小花园', 'We have a small garden', '小学二年级'),
  ('他们正在踢足球', 'They are playing football', '小学二年级'),
  ('这是我的玩具', 'This is my toy', '小学二年级');

-- ========================================
-- 小学三年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我会游泳', 'I can swim', '小学三年级'),
  ('她正在写作业', 'She is doing homework', '小学三年级'),
  ('他们昨天去了公园', 'They went to the park yesterday', '小学三年级'),
  ('我们明天要去购物', 'We are going shopping tomorrow', '小学三年级'),
  ('这个苹果很甜', 'This apple is very sweet', '小学三年级');

-- ========================================
-- 小学四年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我喜欢听音乐', 'I like listening to music', '小学四年级'),
  ('她正在唱歌', 'She is singing', '小学四年级'),
  ('他们每天早上跑步', 'They run every morning', '小学四年级'),
  ('我们昨天去参观了博物馆', 'We visited the museum yesterday', '小学四年级'),
  ('这只鸟飞得很高', 'This bird flies very high', '小学四年级');

-- ========================================
-- 小学五年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我喜欢吃冰淇淋', 'I like eating ice cream', '小学五年级'),
  ('她正在做饭', 'She is cooking', '小学五年级'),
  ('他们上个月去了北京', 'They went to Beijing last month', '小学五年级'),
  ('我们下周要参加考试', 'We are going to take an exam next week', '小学五年级'),
  ('这辆车很快', 'This car is very fast', '小学五年级');

-- ========================================
-- 小学六年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我喜欢打网球', 'I like playing tennis', '小学五年级'),
  ('她正在练习钢琴', 'She is practicing the piano', '小学五年级'),
  ('他们去年去了日本', 'They went to Japan last year', '小学五年级'),
  ('我们下个月要搬家', 'We are going to move house next month', '小学五年级'),
  ('这个电脑很新', 'This computer is very new', '小学五年级');

-- ========================================
-- 初中一年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对编程很感兴趣', 'I am very interested in programming', '初中一年级'),
  ('她正在学习日语', 'She is learning Japanese', '初中一年级'),
  ('他们经常去图书馆学习', 'They often go to the library to study', '初中一年级'),
  ('我们去年夏天去了海边', 'We went to the seaside last summer', '初中一年级'),
  ('这部电影非常精彩', 'This movie is very wonderful', '初中一年级');

-- ========================================
-- 初中二年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我想学习新的技能', 'I want to learn new skills', '初中二年级'),
  ('她正在准备期末考试', 'She is preparing for the final exam', '初中二年级'),
  ('他们计划明年去欧洲旅行', 'They plan to travel to Europe next year', '初中二年级'),
  ('我们上个周末去爬山了', 'We went hiking last weekend', '初中二年级'),
  ('这个游戏非常有挑战性', 'This game is very challenging', '初中二年级');

-- ========================================
-- 初中三年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对历史很感兴趣', 'I am very interested in history', '初中三年级'),
  ('她正在学习写作', 'She is learning to write', '初中三年级'),
  ('他们经常参加志愿活动', 'They often participate in volunteer activities', '初中三年级'),
  ('我们去年冬天去了滑雪', 'We went skiing last winter', '初中三年级'),
  ('这首诗非常优美', 'This poem is very beautiful', '初中三年级');

-- ========================================
-- 高中一年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对物理很感兴趣', 'I am very interested in physics', '高中一年级'),
  ('她正在研究新的科研项目', 'She is researching new scientific projects', '高中一年级'),
  ('他们经常参加学术会议', 'They often attend academic conferences', '高中一年级'),
  ('我们去年去了国际夏令营', 'We went to an international summer camp last year', '高中一年级'),
  ('这个理论非常有深度', 'This theory is very profound', '高中一年级');

-- ========================================
-- 高中二年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对化学很感兴趣', 'I am very interested in chemistry', '高中二年级'),
  ('她正在学习法语', 'She is learning French', '高中二年级'),
  ('他们经常参加辩论比赛', 'They often participate in debate competitions', '高中二年级'),
  ('我们去年去了联合国青少年论坛', 'We went to the UN Youth Forum last year', '高中二年级'),
  ('这个实验非常成功', 'This experiment was very successful', '高中二年级');

-- ========================================
-- 高中三年级题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对生物很感兴趣', 'I am very interested in biology', '高中三年级'),
  ('她正在准备申请大学', 'She is preparing to apply for university', '高中三年级'),
  ('他们经常参加模拟联合国', 'They often participate in Model United Nations', '高中三年级'),
  ('我们去年去了国际科学奥林匹克竞赛', 'We went to the International Science Olympiad last year', '高中三年级'),
  ('这个研究论文很有价值', 'This research paper is very valuable', '高中三年级');

-- ========================================
-- 大学题目（补充到 30 道）
-- ========================================
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对计算机科学很感兴趣', 'I am very interested in computer science', '大学'),
  ('她正在攻读博士学位', 'She is pursuing a doctoral degree', '大学'),
  ('他们经常发表学术论文', 'They often publish academic papers', '大学'),
  ('我们去年参加了国际学术会议', 'We attended an international academic conference last year', '大学'),
  ('这个研究项目很有前景', 'This research project is very promising', '大学');

-- ========================================
-- 更多题目（确保每个年级至少 50 道）
-- ========================================

-- 小学四年级（继续补充）
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我会跳绳', 'I can jump rope', '小学四年级'),
  ('她正在收拾房间', 'She is cleaning the room', '小学四年级'),
  ('他们昨天去参加了运动会', 'They went to the sports meeting yesterday', '小学四年级'),
  ('我们明天要去野餐', 'We are going on a picnic tomorrow', '小学四年级'),
  ('这首歌很好听', 'This song is very good to listen to', '小学四年级'),
  ('我喜欢吃巧克力', 'I like eating chocolate', '小学四年级'),
  ('她正在玩游戏', 'She is playing games', '小学四年级'),
  ('他们经常去游乐园玩', 'They often go to the amusement park', '小学四年级'),
  ('我们上周去看了展览', 'We went to see an exhibition last week', '小学四年级'),
  ('这个故事很有趣', 'This story is very interesting', '小学四年级');

-- 小学五年级（继续补充）
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我会滑冰', 'I can skate', '小学五年级'),
  ('她正在整理书包', 'She is organizing her schoolbag', '小学五年级'),
  ('他们昨天去参加了比赛', 'They went to participate in a competition yesterday', '小学五年级'),
  ('我们明天要去郊游', 'We are going on an outing tomorrow', '小学五年级'),
  ('这部电影很感人', 'This movie is very touching', '小学五年级'),
  ('我喜欢吃蛋糕', 'I like eating cake', '小学五年级'),
  ('她正在学习游泳', 'She is learning to swim', '小学五年级'),
  ('他们经常去动物园参观', 'They often visit the zoo', '小学五年级'),
  ('我们上周去看了话剧', 'We went to watch a play last week', '小学五年级'),
  ('这本书很精彩', 'This book is very wonderful', '小学五年级');

-- 小学六年级（继续补充）
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我会打羽毛球', 'I can play badminton', '小学六年级'),
  ('她正在练习书法', 'She is practicing calligraphy', '小学六年级'),
  ('他们昨天去参加了夏令营', 'They went to summer camp yesterday', '小学六年级'),
  ('我们明天要去参观科技馆', 'We are going to visit the science museum tomorrow', '小学六年级'),
  ('这个展览很精彩', 'This exhibition is very wonderful', '小学六年级'),
  ('我喜欢吃披萨', 'I like eating pizza', '小学六年级'),
  ('她正在学习跳舞', 'She is learning to dance', '小学六年级'),
  ('他们经常去博物馆学习', 'They often go to the museum to study', '小学六年级'),
  ('我们上周去听了音乐会', 'We went to a concert last week', '小学六年级'),
  ('这首诗很美', 'This poem is very beautiful', '小学六年级');

-- 初中一年级（继续补充）
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对地理很感兴趣', 'I am very interested in geography', '初中一年级'),
  ('她正在学习摄影', 'She is learning photography', '初中一年级'),
  ('他们经常参加户外活动', 'They often participate in outdoor activities', '初中一年级'),
  ('我们去年去了海边度假', 'We went to the seaside for vacation last year', '初中一年级'),
  ('这个展览很有意义', 'This exhibition is very meaningful', '初中一年级'),
  ('我喜欢吃寿司', 'I like eating sushi', '初中一年级'),
  ('她正在学习烹饪', 'She is learning to cook', '初中一年级'),
  ('他们经常去农场体验生活', 'They often go to the farm to experience life', '初中一年级'),
  ('我们上周去看了魔术表演', 'We went to watch a magic show last week', '初中一年级'),
  ('这个游戏很有趣', 'This game is very interesting', '初中一年级');

-- 初中二年级（继续补充）
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对艺术很感兴趣', 'I am very interested in art', '初中二年级'),
  ('她正在学习设计', 'She is learning design', '初中二年级'),
  ('他们经常参加文化展览', 'They often participate in cultural exhibitions', '初中二年级'),
  ('我们去年去了古城旅游', 'We went to the ancient city for tourism last year', '初中二年级'),
  ('这个建筑很壮观', 'This building is very magnificent', '初中二年级'),
  ('我喜欢吃汉堡', 'I like eating hamburgers', '初中二年级'),
  ('她正在学习园艺', 'She is learning gardening', '初中二年级'),
  ('他们经常去植物园参观', 'They often visit the botanical garden', '初中二年级'),
  ('我们上周去看了戏剧', 'We went to watch a drama last week', '初中二年级'),
  ('这个作品很优秀', 'This work is very excellent', '初中二年级');

-- 初中三年级（继续补充）
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对文学很感兴趣', 'I am very interested in literature', '初中三年级'),
  ('她正在学习新闻', 'She is learning journalism', '初中三年级'),
  ('他们经常参加文学沙龙', 'They often participate in literary salons', '初中三年级'),
  ('我们去年去了图书馆学习', 'We went to the library to study last year', '初中三年级'),
  ('这篇文章很深刻', 'This article is very profound', '初中三年级'),
  ('我喜欢吃沙拉', 'I like eating salad', '初中三年级'),
  ('她正在学习写作', 'She is learning to write', '初中三年级'),
  ('他们经常去书店看书', 'They often go to the bookstore to read', '初中三年级'),
  ('我们上周去看了艺术展', 'We went to an art exhibition last week', '初中三年级'),
  ('这个创意很独特', 'This idea is very unique', '初中三年级');

-- 高中一年级（继续补充）
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对数学很感兴趣', 'I am very interested in mathematics', '高中一年级'),
  ('她正在学习经济学', 'She is learning economics', '高中一年级'),
  ('他们经常参加社会实践活动', 'They often participate in social practice activities', '高中一年级'),
  ('我们去年去了乡村支教', 'We went to the countryside to volunteer teach last year', '高中一年级'),
  ('这个调查报告很有价值', 'This survey report is very valuable', '高中一年级'),
  ('我喜欢吃意大利面', 'I like eating pasta', '高中一年级'),
  ('她正在学习统计', 'She is learning statistics', '高中一年级'),
  ('他们经常去养老院志愿服务', 'They often volunteer at nursing homes', '高中一年级'),
  ('我们上周去看了纪录片', 'We went to watch a documentary last week', '高中一年级'),
  ('这个研究很有意义', 'This research is very meaningful', '高中一年级');

-- 高中二年级（继续补充）
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对政治学很感兴趣', 'I am very interested in political science', '高中二年级'),
  ('她正在学习国际关系', 'She is learning international relations', '高中二年级'),
  ('他们经常参加模拟听证会', 'They often participate in mock hearings', '高中二年级'),
  ('我们去年去了外交部参观', 'We went to visit the Ministry of Foreign Affairs last year', '高中二年级'),
  ('这个政策很有影响力', 'This policy has great influence', '高中二年级'),
  ('我喜欢吃牛排', 'I like eating steak', '高中二年级'),
  ('她正在学习法律', 'She is learning law', '高中二年级'),
  ('他们经常去法院旁听', 'They often go to the court to observe hearings', '高中二年级'),
  ('我们上周去看了辩论赛', 'We went to watch a debate contest last week', '高中二年级'),
  ('这个观点很有说服力', 'This point of view is very persuasive', '高中二年级');

-- 高中三年级（继续补充）
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对哲学很感兴趣', 'I am very interested in philosophy', '高中三年级'),
  ('她正在学习心理学', 'She is learning psychology', '高中三年级'),
  ('他们经常参加思想讨论会', 'They often participate in philosophical discussion meetings', '高中三年级'),
  ('我们去年去了大学参观', 'We went to visit the university last year', '高中三年级'),
  ('这个理论很经典', 'This theory is very classic', '高中三年级'),
  ('我喜欢吃火锅', 'I like eating hot pot', '高中三年级'),
  ('她正在学习社会学', 'She is learning sociology', '高中三年级'),
  ('他们经常去社会调查', 'They often go to conduct social surveys', '高中三年级'),
  ('我们上周去看了讲座', 'We went to watch a lecture last week', '高中三年级'),
  ('这个思想很有启发性', 'This thought is very enlightening', '高中三年级');

-- 大学（继续补充）
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我对医学很感兴趣', 'I am very interested in medicine', '大学'),
  ('她正在学习临床医学', 'She is studying clinical medicine', '大学'),
  ('他们经常参加医学会议', 'They often attend medical conferences', '大学'),
  ('我们去年去了医院实习', 'We went to the hospital for internship last year', '大学'),
  ('这个治疗方法很有效', 'This treatment method is very effective', '大学'),
  ('我喜欢吃海鲜', 'I like eating seafood', '大学'),
  ('她正在学习药学', 'She is studying pharmacy', '大学'),
  ('他们经常去实验室做实验', 'They often go to the laboratory to do experiments', '大学'),
  ('我们上周去看了学术报告', 'We went to watch an academic report last week', '大学'),
  ('这个研究很有创新性', 'This research is very innovative', '大学');

-- ========================================
-- 最终统计
-- ========================================
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
