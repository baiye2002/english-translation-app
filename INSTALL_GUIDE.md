# 英语翻译大师 App 安装指南

## 📱 方式一：使用 Expo Go（推荐用于开发测试）

这是最简单的方式，无需构建，直接扫码即可。

### ✅ 当前状态
开发服务已启动，可以通过以下地址访问：
```
Web 版: https://932f7c46-5efa-4bc6-a25d-e734058582ad.dev.coze.site
```

### 步骤

#### 1. 安装 Expo Go

**Android 用户：**
1. 打开 Google Play 商店
2. 搜索 "Expo Go"
3. 安装应用

**iOS 用户：**
1. 打开 App Store
2. 搜索 "Expo Go"
3. 安装应用

#### 2. 通过 URL 打开

如果你能获取到开发服务器的 QR 码或 URL（格式：`exp://xxx`）：

1. 打开 Expo Go 应用
2. 点击右下角的 "+" 按钮
3. 选择 "Enter URL manually" 或 "Scan QR Code"
4. 输入 URL 或扫描二维码
5. 点击 "Go"

#### 3. 使用 Web 版本

直接在手机浏览器中访问：
```
https://932f7c46-5efa-4bc6-a25d-e734058582ad.dev.coze.site
```

---

## 📦 方式二：构建独立应用（推荐用于正式发布）

生成独立的 APK/IPA 文件，可以发布到应用商店。

### 前提条件

- **EAS Account**: https://expo.dev
- **GitHub** 或其他 Git 仓库（可选，但推荐）
- **开发环境**：Node.js, npm/pnpm

### 步骤

#### 1. 安装 EAS CLI

```bash
# 全局安装 EAS CLI
npm install -g eas-cli

# 登录 EAS 账户
eas login
```

#### 2. 配置 EAS

在项目根目录创建 `eas.json` 配置文件：

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

#### 3. 配置 Android 构建

**Android 用户需要：**
1. 创建 Keystore 文件
2. 配置签名信息

```bash
# 生成 Keystore（仅首次）
keytool -genkeypair -v -storetype PKCS12 -keystore your-upload-key.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

在 `eas.json` 中添加 Android 配置：

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

#### 4. 配置 iOS 构建

**iOS 用户需要：**
1. Apple Developer 账户（$99/年）
2. 配置 Provisioning Profile

在 `eas.json` 中添加 iOS 配置：

```json
{
  "build": {
    "production": {
      "ios": {
        "autoIncrement": true
      }
    }
  }
}
```

#### 5. 构建应用

**构建 Android APK（调试版本）：**
```bash
cd /workspace/projects/client
eas build --platform android --profile preview
```

**构建 Android APK（生产版本）：**
```bash
cd /workspace/projects/client
eas build --platform android --profile production
```

**构建 iOS IPA：**
```bash
cd /workspace/projects/client
eas build --platform ios --profile preview
```

#### 6. 下载安装

构建完成后，你会收到包含下载链接的邮件或通知。

**Android APK 安装：**
1. 下载 APK 文件
2. 在手机上启用"未知来源"安装
3. 点击 APK 文件安装

**iOS IPA 安装：**
1. 下载 IPA 文件
2. 使用 TestFlight 或 AltStore 安装
3. 或通过 Xcode 安装到设备

---

## 🎯 推荐流程

### 开发测试阶段
✅ 使用 **Expo Go** 或 **Web 版本**
- 快速迭代
- 实时预览
- 无需构建

### 正式发布阶段
✅ 使用 **EAS Build** 构建 APK/IPA
- 独立应用
- 可发布到应用商店
- 更好的性能

---

## 📝 常见问题

### Q1: Expo Go 无法连接？
**A:** 确保手机和开发服务器在同一网络，或者使用公共 URL。

### Q2: Web 版本功能不全？
**A:** 部分原生功能（如相机、GPS）在 Web 版本中受限，建议使用 Expo Go 或构建独立应用。

### Q3: 构建失败怎么办？
**A:** 检查：
1. EAS 账户是否正确配置
2. 依赖是否完整安装
3. 配置文件是否正确

### Q4: 如何更新应用？
**A:**
- Expo Go：刷新即可
- 独立应用：重新构建并安装新版本

---

## 🔗 有用链接

- **Expo 官方文档**: https://docs.expo.dev
- **EAS Build 文档**: https://docs.expo.dev/build/introduction/
- **Expo Go 下载**: https://expo.dev/client
- **EAS 控制台**: https://expo.dev

---

## 💡 提示

- 开发阶段优先使用 Expo Go，效率最高
- 如果需要发布到应用商店，使用 EAS Build
- Web 版本适合快速演示和测试
- 定期备份代码和配置文件
