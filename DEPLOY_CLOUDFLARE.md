# 方案 1：Vercel + Cloudflare 免费加速方案

## 🎯 方案概述

通过 Cloudflare CDN 加速 Vercel 部署的静态网站，解决中国大陆访问超时问题。

**优势**：
- ✅ 完全免费
- ✅ 无需修改现有 Vercel 部署
- ✅ 配置简单（5分钟）
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS 证书
- ✅ DDoS 防护

---

## 📋 前置条件

- 一个 Cloudflare 账号（免费）
- 一个自定义域名（必需）

**注意**：Cloudflare 必须绑定自定义域名，不能直接加速 Vercel 默认域名。

如果你没有域名：
- 注册域名：阿里云（.com 约 60元/年）、腾讯云、Namecheap
- 或使用 Cloudflare 的 **Cloudflare Pages**（方案 2）

---

## 🚀 配置步骤

### 步骤 1：注册 Cloudflare（1分钟）

1. 访问：https://dash.cloudflare.com/sign-up
2. 使用邮箱注册账号
3. 完成 Email 验证

---

### 步骤 2：添加域名（1分钟）

1. 登录 Cloudflare 控制台
2. 点击 **Add a Site**
3. 输入你的域名（例如：`english-translation.com`）
4. 选择 **Free** 计划
5. 点击 **Continue**

---

### 步骤 3：配置 DNS（2分钟）

#### 3.1 Cloudflare 会自动扫描你的 DNS 记录

#### 3.2 添加 CNAME 记录指向 Vercel

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| CNAME | www | `english-translation-app.vercel.app` | 已代理（橙色云朵） |

**操作**：
1. 点击 **Add Record**
2. Type: `CNAME`
3. Name: `www`（或你想要的子域名）
4. Target: `english-translation-app.vercel.app`
5. Proxy status: **Proxied**（橙色云朵图标）- ⚠️ 重要！
6. 点击 **Save**

#### 3.3 （可选）添加根域名

如果你也想通过根域名访问：

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| CNAME | @ | `english-translation-app.vercel.app` | 已代理（橙色云朵） |

---

### 步骤 4：更换域名服务器（1分钟）

1. Cloudflare 会提供两个 Nameserver，例如：
   - `lola.ns.cloudflare.com`
   - `mark.ns.cloudflare.com`

2. 登录你的域名注册商（阿里云/腾讯云/Namecheap）
3. 找到域名管理 -> DNS 设置
4. 将 Nameserver 更换为 Cloudflare 提供的地址

**生效时间**：通常需要 10-60 分钟

---

### 步骤 5：在 Vercel 添加自定义域名（1分钟）

1. 访问 Vercel 控制台：https://vercel.com/dashboard
2. 进入 `english-translation-app` 项目
3. 点击 **Settings** -> **Domains**
4. 输入你的自定义域名：`www.english-translation.com`
5. 点击 **Add**

Vercel 会自动配置 DNS 记录。

---

### 步骤 6：验证配置

#### 6.1 等待 DNS 生效

使用以下命令检查 DNS 是否已切换到 Cloudflare：

```bash
# 检查 CNAME 记录
nslookup www.english-translation.com

# 或使用 dig
dig CNAME www.english-translation.com
```

应该看到 Cloudflare 的地址。

#### 6.2 访问网站

1. 打开浏览器
2. 访问：`https://www.english-translation.com`
3. 如果显示你的网站，配置成功！

---

## 🔧 高级配置

### 1. 自动 HTTPS

Cloudflare 会自动为你的域名提供 SSL 证书。

在 Cloudflare 控制台：
1. 进入 **SSL/TLS** 标签
2. 模式设置为 **Full**（推荐）

### 2. 缓存配置

在 Cloudflare 控制台：
1. 进入 **Caching** 标签
2. 配置缓存规则
3. 推荐设置：
   - Browser Cache TTL: 4 hours
   - Caching Level: Standard

### 3. 页面规则（可选）

创建规则优化缓存：

1. 进入 **Page Rules** 标签
2. 添加规则：`*english-translation.com/_expo/*`
3. 设置：Cache Level: Cache Everything
4. Edge Cache TTL: 1 month

### 4. Bypass Cache on Cookie（可选）

如果你的应用有动态内容，可以配置绕过缓存：

1. 进入 **Page Rules** 标签
2. 添加规则：`*english-translation.com/*`
3. 设置：Bypass Cache on Cookie

---

## 📊 性能优化

### 1. 启用 HTTP/3

在 Cloudflare 控制台：
1. 进入 **Network** 标签
2. 开启 **HTTP/3 (QUIC)**

### 2. 启用 Rocket Loader

在 Cloudflare 控制台：
1. 进入 **Speed** -> **Optimization**
2. 开启 **Rocket Loader**

### 3. 启用 Brotli 压缩

在 Cloudflare 控制台：
1. 进入 **Speed** -> **Optimization**
2. 开启 **Brotli**

---

## ⚠️ 注意事项

### 1. 域名费用

- Cloudflare 免费计划：完全免费
- 域名费用：约 60-100 元/年（在阿里云/腾讯云注册）

### 2. DNS 生效时间

- 首次切换 Nameserver：10-60 分钟
- 后续 DNS 记录变更：通常 5-10 分钟

### 3. Vercel 限制

- Vercel 免费计划：100GB 带宽/月
- 通过 Cloudflare 后，Cloudflare 带宽无限，但 Vercel 到 Cloudflare 的流量仍计入 Vercel 限制

### 4. WebSockets 支持

如果你的应用使用 WebSockets：
- 在 Cloudflare 控制台 -> **Network** -> 开启 **WebSockets**

---

## 🎉 完成后

配置完成后：
1. 访问 `https://www.english-translation.com`
2. 在中国可以稳定访问
3. 全球加速，访问速度更快

---

## 📞 故障排查

### 问题 1：访问显示 522 错误

**原因**：Cloudflare 无法连接到 Vercel

**解决**：
1. 检查 Vercel 是否正常运行
2. 检查 DNS 记录是否正确
3. 在 Cloudflare 中检查 DNS Only 模式是否工作

### 问题 2：访问显示 404

**原因**：DNS 配置错误

**解决**：
1. 检查 CNAME 记录是否指向正确的 Vercel 域名
2. 确认 Vercel 中已添加自定义域名

### 问题 3：访问很慢

**原因**：缓存未生效

**解决**：
1. 在 Cloudflare 中清除缓存
2. 等待 CDN 重新缓存

---

## 🆘 需要帮助？

- Cloudflare 文档：https://developers.cloudflare.com/
- Vercel 自定义域名文档：https://vercel.com/docs/concepts/projects/domains
