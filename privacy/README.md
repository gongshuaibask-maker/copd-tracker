# Privacy Policy — 部署说明

## 方式 1：GitHub Pages（推荐）

1. 在 GitHub 创建仓库：`copd-tracker-privacy`（Public）
2. 将本目录下所有文件上传到该仓库
3. Settings → Pages → Source: `main` branch
4. 等待 1-2 分钟后，访问：`https://你的用户名.github.io/copd-tracker-privacy/`
5. 将上述 URL 填入 `app.json` 的 `extra.privacyPolicyUrl`

## 方式 2：Netlify / Vercel（免费）

1. 注册 Netlify / Vercel 账号
2. 拖拽 `privacy/` 文件夹到部署页面
3. 获得 URL：`https://xxx.netlify.app`
4. 将 URL 填入 `app.json`

## 方式 3：GitHub Gist（最快速）

1. 打开 https://gist.github.com/
2. 创建新 Gist，文件名为 `privacy-policy.html`
3. 复制 `privacy/index.html` 内容粘贴
4. 获得 Raw URL：`https://gist.githubusercontent.com/.../raw/.../privacy-policy.html`
5. 将此 URL 填入 `app.json`

## 当前文件结构

```
privacy/
  ├── index.html    ← 隐私政策主页面
  ├── CNAME         ← 可选：自定义域名
  └── README.md     ← 本文件
```
