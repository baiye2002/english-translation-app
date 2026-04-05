# 豆包模型 ID 问题排查

## 当前错误

`NotFoundError: 404 status code (no body)` - `MODEL_NOT_FOUND`

## 已完成的修改

✅ 将 API 端点修改为豆包火山引擎：`https://ark.cn-beijing.volces.com/api/v3`

## 可能的问题

### 问题 1：模型 ID 不正确

代码中使用的模型 ID：`doubao-seed-1-8-251228`

这个模型 ID 可能不适用于火山引擎 API。

### 豆包火山引擎常用的模型 ID

根据火山引擎官方文档，常用的模型 ID 包括：

| 模型 ID | 描述 |
|---------|------|
| `doubao-pro-32k` | 豆包 Pro 模型（32K 上下文） |
| `doubao-lite-32k` | 豆包 Lite 模型（32K 上下文） |
| `doubao-pro-4k` | 豆包 Pro 模型（4K 上下文） |
| `doubao-lite-4k` | 豆包 Lite 模型（4K 上下文） |

### 问题 2：需要使用推理接入点（Endpoint ID）

火山引擎 API 可能需要使用推理接入点 ID 而不是模型名称。

## 解决方案

### 方案 1：查看可用的模型 ID

1. 访问火山引擎控制台：https://console.volcengine.com/ark
2. 进入"模型推理"或"推理接入点"页面
3. 查看已创建的推理接入点列表
4. 找到推理接入点 ID（Endpoint ID）

### 方案 2：创建推理接入点

1. 在火山引擎控制台进入"模型推理"
2. 点击"创建推理接入点"
3. 选择模型（如：豆包-Pro-32K）
4. 创建完成后，复制推理接入点 ID

### 方案 3：修改代码使用正确的模型 ID

如果获取到正确的模型 ID 或推理接入点 ID，需要修改 `server/src/services/llmService.ts` 文件第 139 行：

```typescript
const response = await client.invoke(messages, {
  model: 'YOUR_ENDPOINT_ID_HERE', // 修改为你的推理接入点 ID 或模型 ID
  temperature: 0.3,
});
```

## 测试步骤

1. 推送最新代码到 GitHub
2. 等待 Railway 重新部署
3. 测试提交答案功能
4. 如果仍然报 404 错误，查看火山引擎控制台获取正确的模型 ID

## 常见问题

### Q: 如何找到我的推理接入点 ID？

A:
1. 访问 https://console.volcengine.com/ark/endpoint
2. 在列表中找到推理接入点
3. 推理接入点 ID 通常在名称旁边或详情页面中

### Q: 模型 ID 和推理接入点 ID 有什么区别？

A:
- **模型 ID**：代表模型的类型（如 `doubao-pro-32k`）
- **推理接入点 ID**：代表你在火山引擎平台上创建的具体推理实例
- 使用推理接入点 ID 可以获得更好的性能和独立的资源

### Q: 如何确认我的 API Key 是正确的？

A:
- API Key 认证已通过（从 401 错误变为 404 错误）
- 当前问题是模型找不到，说明 API Key 是有效的

## 下一步

1. 访问火山引擎控制台，找到可用的模型 ID 或推理接入点 ID
2. 将正确的 ID 告诉我，我帮您修改代码
3. 推送代码并重新部署
4. 测试功能

## 参考

- 火山方舟官方文档：https://www.volcengine.com/docs/82379
- API Key 管理：https://console.volcengine.com/ark/setting/apikeys
- 推理接入点管理：https://console.volcengine.com/ark/endpoint
