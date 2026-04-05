-- 英语翻译学习应用 - 题目数据初始化脚本
-- 在 Supabase SQL Editor 中执行（在创建表之后执行）

-- 插入小学四年级题目
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我喜欢读书', 'I like reading books', '小学四年级'),
  ('她正在看电视', 'She is watching TV', '小学四年级'),
  ('他们每天都去学校', 'They go to school every day', '小学四年级'),
  ('我的妈妈是一名医生', 'My mother is a doctor', '小学四年级'),
  ('我们有一个大花园', 'We have a big garden', '小学四年级'),
  ('这只猫很可爱', 'This cat is very cute', '小学四年级'),
  ('他会说英语和中文', 'He can speak English and Chinese', '小学四年级'),
  ('今天是星期六', 'Today is Saturday', '小学四年级'),
  ('我想喝一杯水', 'I want to drink a glass of water', '小学四年级'),
  ('苹果很好吃', 'Apples are very delicious', '小学四年级'),

  ('我的书包是红色的', 'My schoolbag is red', '小学四年级'),
  ('她喜欢吃香蕉', 'She likes eating bananas', '小学四年级'),
  ('我们通常在晚上做作业', 'We usually do homework in the evening', '小学四年级'),
  ('我的弟弟很淘气', 'My younger brother is very naughty', '小学四年级'),
  ('图书馆里有很多书', 'There are many books in the library', '小学四年级'),

  ('我会弹钢琴', 'I can play the piano', '小学四年级'),
  ('她经常帮我做家务', 'She often helps me with housework', '小学四年级'),
  ('他们正在公园里玩耍', 'They are playing in the park', '小学四年级'),
  ('我的生日在六月', 'My birthday is in June', '小学四年级'),
  ('这道菜非常好吃', 'This dish is very delicious', '小学四年级');

-- 插入小学五年级题目
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我昨天去动物园了', 'I went to the zoo yesterday', '小学五年级'),
  ('她正在做蛋糕', 'She is making a cake', '小学五年级'),
  ('他们下个星期要去看电影', 'They are going to watch a movie next week', '小学五年级'),
  ('我的哥哥是一名工程师', 'My older brother is an engineer', '小学五年级'),
  ('我们需要更多的水', 'We need more water', '小学五年级'),

  ('这只狗跑得很快', 'This dog runs very fast', '小学五年级'),
  ('她明天要去看医生', 'She is going to see a doctor tomorrow', '小学五年级'),
  ('我们通常在周末去爬山', 'We usually go hiking on weekends', '小学五年级'),
  ('我的梦想是成为一名科学家', 'My dream is to become a scientist', '小学五年级'),
  ('这些花闻起来很香', 'These flowers smell very good', '小学五年级'),

  ('我会骑自行车', 'I can ride a bike', '小学五年级'),
  ('她已经完成了作业', 'She has already finished her homework', '小学五年级'),
  ('他们正在讨论这个问题', 'They are discussing this problem', '小学五年级'),
  ('我的家乡在中国', 'My hometown is in China', '小学五年级'),
  ('这道菜需要放一些盐', 'This dish needs some salt', '小学五年级');

-- 插入小学六年级题目
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我经常去图书馆', 'I often go to the library', '小学六年级'),
  ('她喜欢在公园里散步', 'She likes walking in the park', '小学六年级'),
  ('他们正在学习英语', 'They are learning English', '小学六年级'),
  ('我的父亲是一名教师', 'My father is a teacher', '小学六年级'),
  ('我们有一个大家庭', 'We have a big family', '小学六年级'),

  ('这只鸟会唱歌', 'This bird can sing', '小学六年级'),
  ('她喜欢喝咖啡', 'She likes drinking coffee', '小学六年级'),
  ('我们每天早上锻炼', 'We exercise every morning', '小学六年级'),
  ('我的目标是考上大学', 'My goal is to get into college', '小学六年级'),
  ('这些苹果又大又甜', 'These apples are big and sweet', '小学六年级'),

  ('我会游泳', 'I can swim', '小学六年级'),
  ('她已经学会了开车', 'She has already learned how to drive', '小学六年级'),
  ('他们正在准备考试', 'They are preparing for the exam', '小学六年级'),
  ('我的爱好是画画', 'My hobby is drawing', '小学六年级'),
  ('这道菜需要煮很长时间', 'This dish needs to be cooked for a long time', '小学六年级');

-- 插入初中一年级题目
INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES
  ('我喜欢打篮球', 'I like playing basketball', '初中一年级'),
  ('她正在学习弹吉他', 'She is learning to play the guitar', '初中一年级'),
  ('他们打算明天去旅行', 'They plan to go on a trip tomorrow', '初中一年级'),
  ('我的姐姐是一名护士', 'My older sister is a nurse', '初中一年级'),
  ('我们需要保护环境', 'We need to protect the environment', '初中一年级'),

  ('这只猫喜欢捉老鼠', 'This cat likes catching mice', '初中一年级'),
  ('她经常参加学校的活动', 'She often participates in school activities', '初中一年级'),
  ('我们通常在夏天去游泳', 'We usually go swimming in summer', '初中一年级'),
  ('我的愿望是环游世界', 'My wish is to travel around the world', '初中一年级'),
  ('这个故事非常有趣', 'This story is very interesting', '初中一年级'),

  ('我会使用电脑', 'I can use a computer', '初中一年级'),
  ('她已经完成了项目', 'She has already completed the project', '初中一年级'),
  ('他们正在讨论未来的计划', 'They are discussing their future plans', '初中一年级'),
  ('我的专业是计算机科学', 'My major is computer science', '初中一年级'),
  ('这个问题需要仔细思考', 'This problem needs careful consideration', '初中一年级');

-- 查看插入的题目数量
SELECT difficulty, COUNT(*) as count FROM questions GROUP BY difficulty;
