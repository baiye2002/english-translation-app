# LLM 评判功能配置说明

## 问题描述

提交答案功能报错：`AuthenticationError: 401 The API key format is incorrect`

## 根本原因

`coze-coding-dev-sdk` 内部调用的是豆包（火山引擎）API，但用户配置的是 Coze PAT。

## API Key 格式说明

### Coze PAT（Personal Access Token）
- 格式：`pat_xxxx`（如：`pat_3QCeMXEb6u7Pbyqf5YBLZ94V4Egq4Quq4KWMfvHRypPOOPOFEG73VnM3jnjnqhFW`）
- 用途：Coze Workload Identity 认证
- 不兼容：豆包 API

### Coze API Key
- 格式：通常是 `sk_xxxx` 或类似格式
- 用途：直接调用 Coze API
- 需要从 Coze 控制台获取

### 豆包/火山引擎 API Key
- 格式：通常是 `sk_xxxx` 或 `AK-xxxx`
- 用途：调用豆包/火山引擎 API
- 需要从火山引擎控制台获取

## 解决方案

### 方案 1：使用 Coze API Key（推荐）

1. 访问 Coze 控制台（https://www.coze.cn）
2. 获取 Coze API Key（不是 PAT）
3. 在 Railway 配置环境变量：
   - 变量名：`COZE_API_KEY`
   - 值：你的 Coze API Key
4. 修改代码使用 `COZE_API_KEY` 环境变量

### 方案 2：使用豆包 API Key

1. 访问火山引擎控制台（https://console.volcengine.com/ark）
2. 获取豆包 API Key
3. 在 Railway 配置环境变量：
   - 变量名：`ARK_API_KEY` 或 `DOUBAO_API_KEY`
   - 值：你的豆包 API Key
4. 修改代码使用正确的环境变量

## 当前代码配置

当前代码尝试从以下环境变量读取 API Key：
1. `COZE_WORKLOAD_IDENTITY_API_KEY`（Coze PAT，可能不兼容）
2. `COZE_PROJECT_ID`（Coze 项目 ID，不是 API Key）

## 下一步

请提供：
1. Coze API Key（方案 1）
2. 或豆包 API Key（方案 2）
3. 或确认希望使用哪种 API 服务

## 测试

配置完成后，请测试提交答案功能，查看是否返回正确的评判结果。
