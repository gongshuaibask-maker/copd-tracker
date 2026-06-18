# COPD App — 构建与发布指南

## 前置条件

1. 安装 EAS CLI：`npm install -g eas-cli`
2. 登录 Expo 账号：`eas login`
3. iOS 构建需要 Apple Developer 账号（$99/年）
4. Android 构建需要 Google Play 开发者账号（$25 一次性）

## 构建命令

```bash
# === 开发构建（带 Dev Client）===
eas build --platform ios --profile development    # iOS 开发版
eas build --platform android --profile development  # Android 开发版

# === 内部测试 ===
eas build --platform ios --profile preview        # iOS 内部测试（TestFlight 前）
eas build --platform android --profile preview     # Android APK 内部测试

# === 生产构建（商店上架）===
eas build --platform ios --profile production     # iOS App Store
eas build --platform android --profile production  # Google Play AAB

# === 一键提交到商店 ===
eas submit --platform ios --profile production
eas submit --platform android --profile production

# === 更新 OTA ===
eas update --branch production --message "Bug fixes"
```

## 构建前检查清单

- [ ] `tsc --noEmit` 零错误
- [ ] `app.json` 中 bundleIdentifier 已设置
- [ ] `app.json` 中 privacyPolicyUrl 可访问
- [ ] 图标文件 `assets/images/icon.png` 已生成（1024×1024）
- [ ] 启动屏配置正确（参见 splash-screen.md）
- [ ] 医疗免责声明已添加
- [ ] eas.json 中 appleId / teamId 已配置

## 图标尺寸速查

| 平台 | 尺寸 | 说明 |
|------|------|------|
| iOS | 1024×1024 | App Store Connect 主图标 |
| iOS | 180×180 | iPhone 60pt @3x |
| iOS | 120×120 | iPhone 60pt @2x |
| Android | 512×512 | Google Play 商店 |
| Android | 48×48 | mdpi |
| Android | 96×96 | hdpi |
| Android | 192×192 | xxxhdpi |

> 使用 `assets/images/generate-icons.html` 在浏览器中一键生成全部尺寸。

## TestFlight 提交流程

1. `eas build --platform ios --profile production`
2. 构建完成后，进入 App Store Connect → TestFlight
3. 添加内部测试员
4. 测试通过后提交审核

## Google Play 提交流程

1. `eas build --platform android --profile production`
2. 下载 AAB 文件
3. 上传至 Google Play Console
4. 填写应用信息（描述/截图/分级）
5. 提交审核

## 常见问题

### 构建失败
- 检查 `eas build:list` 查看构建日志
- 常见原因：Node 模块缺失 → `npm install`
- iOS 构建需要 macOS（EAS Build 云端无需）

### OTA 更新
- `eas update --branch production --message "描述"`
- 无需重新构建，用户下次打开 App 自动获取更新
