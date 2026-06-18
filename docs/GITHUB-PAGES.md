# GitHub Pages 部署指南

> 用 GitHub Pages 托管隐私政策页面和营销着陆页（可选方案）
> **当前实际部署**：Netlify → https://copd-selfcare.netlify.app
> **源代码仓库**：https://github.com/gongshuai888/copd-tracker

---

## 方案：使用 GitHub Pages（仅隐私政策+着陆页）

### 1. 创建独立仓库

```bash
# 在 GitHub 上创建独立仓库用于托管页面
# 仓库名：gongshuai888/copd-tracker-landing
```

### 2. 部署结构

将 `landing/` 目录内容部署到 GitHub Pages：

```
index.html              # 着陆页
icon-240.png            # App 图标
privacy-policy/
└── index.html          # 隐私政策
support/
└── index.html          # 支持页面
```

### 3. 操作步骤

```bash
# 克隆仓库
git clone https://github.com/copd-tracker/copd-tracker.github.io.git

# 复制网站文件
cp D:\copdAPP\landing\* copd-tracker.github.io/
mkdir -p copd-tracker.github.io/privacy-policy
cp D:\copdAPP\privacy\index.html copd-tracker.github.io/privacy-policy/index.html

# 推送
cd copd-tracker.github.io
git add .
git commit -m "Initial website deployment"
git push
```

### 4. 自定义域名 (可选)

创建 `CNAME` 文件：
```
copd-tracker.app
```

然后在域名 DNS 添加 CNAME 记录指向 `copd-tracker.github.io`。

---

## 方案二：使用 Vercel / Netlify (更简单)

### Netlify
1. 登录 [netlify.com](https://netlify.com)
2. 拖拽 `landing/` 文件夹到部署区域
3. 自动获得 `copd-app.netlify.app` 域名
4. 可绑定自定义域名

### Vercel
```bash
npm install -g vercel
cd landing
vercel --prod
```

---

## 部署后操作

1. 验证隐私政策页面可访问：`https://copd-selfcare.netlify.app/privacy-policy`
2. 在 `app.json` 中更新 `extra.privacyPolicyUrl`（已更新为 Netlify URL）
3. 在 App Store Connect 和 Google Play Console 中填写隐私政策 URL

---

## 文件清单

| 文件 | 来源 | 部署路径 |
|------|------|----------|
| `landing/index.html` | 着陆页 | `/index.html` |
| `landing/icon-240.png` | App 图标 | `/icon-240.png` |
| `privacy/index.html` | 隐私政策 | `/privacy-policy/index.html` |
| `docs/privacy-policy.html` | 备份 | — |
