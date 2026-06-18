# 🚀 Product Hunt 发布文案包（v1.0.0 · 2026-06-18 更新）

> 基于最新版 APP（12 模块 + UI 视觉升级）重新整理
> 实际部署：https://copd-selfcare.netlify.app

---

## 📛 产品名称 (max 40 chars)

```
COPD Self-Management — 慢阻肺自我管理助手
```

## 🏷️ 标语 / Tagline (max 60 chars)

```
Your offline-first COPD health tracker. 12 modules, 100% private.
```

备选：
```
Free, offline-first COPD app: track symptoms, lung function, SpO₂ & more
```
```
慢阻肺患者的私人健康管家 — 12 大模块 · 数据全本地 · 永久免费
```

---

## 📝 描述 / Description

```
🫁 **The Problem**

COPD patients need to track multiple health indicators daily — lung function,
blood oxygen, symptoms, medications, exercise, and more. Existing solutions are
either too complex, require internet, or compromise privacy by uploading health
data to cloud servers.

✨ **Our Solution**

COPD Self-Management is a **100% offline**, free mobile-first web app that puts
you in complete control of your health data. No signup, no cloud, no ads.

**12 Comprehensive Modules:**
- 🫁 Pulmonary Function (20+ indicators, 4-tier classification)
- 🔬 Airway Inflammation (FeNO, blood/sputum EOS)
- 📋 Symptom Scoring (CAT-8 + mMRC scales)
- 🏃 Exercise Tolerance (6MWT with Borg scores)
- 💓 Daily Vitals (SpO₂, HR, RR with smart alerts)
- ⚖️ Nutrition & Weight (BMI auto-calc)
- 🚨 Exacerbation Tracking (GOLD 2026 risk assessment)
- 💊 Medication Log (inhaler technique scoring)
- 🏥 Comorbidity Management
- 🚭 Smoking Cessation (FTND scale)
- 😴 Sleep Monitoring (nocturnal SpO₂, ODI, T90)
- 🏋️ Pulmonary Rehabilitation (exercise type/duration/Borg)

**Key Features:**
- 🔒 **100% Local Storage** — SQLite on your device, zero data upload
- 🤖 **OCR Smart Recognition** — paste or snap reports, auto-fill 20+ indicators
- 🧠 **Report Conclusion Extraction** — auto-extracts diagnosis text + check date
- 📊 **Trend Charts** — auto-generated line charts for all metrics
- 🔔 **Smart Reminders** — daily SpO₂, monthly CAT, follow-up alerts
- 📸 **Photo Gallery** — document medical reports with photos per module
- 🏥 **Health Screening** — PHQ-2 (depression), GAD-2 (anxiety), SARC-F (frailty)
- 📋 **Action Plan** — green/yellow/red zone COPD self-management plan
- 💉 **Vaccination Tracker** — influenza, pneumococcal, COVID, RSV, Tdap
- 📤 **JSON Export** — backup all your data anytime
- 🎨 **Clean Medical UI** — 科技净白 design, optimized for all ages
- 🌐 **iOS + Android + Web** — built with React Native + Expo

**Tech Stack:** React Native · Expo 54 · TypeScript · SQLite

**Try it now:** https://copd-selfcare.netlify.app
```

---

## 🎯 第一句话 (First Comment — 发布后立即发送)

```
Hey Product Hunt! 👋

I built this app because my family member was diagnosed with COPD and struggled
to keep track of all the different metrics — lung function reports, daily SpO₂,
symptom scores, medications. Paper records got lost, and existing apps either
required signup or uploaded health data to the cloud.

This app is:
- 🆓 100% free, no ads, no subscriptions
- 🔒 All data stays on your phone (SQLite) — zero cloud upload
- 📱 Works on iOS, Android, AND any browser
- 🌐 Fully offline — no internet needed
- 🎨 Beautiful medical UI redesigned with clean visual design system

What's special about v1.0:
- 12 tracking modules covering everything a COPD patient needs
- OCR that actually works — paste a report, get 20+ indicators auto-filled
- Built-in health screenings (PHQ-2, GAD-2, SARC-F)
- GOLD 2026 compliant risk assessment
- Photo gallery for each module to document reports & charts

Try the live demo: https://copd-selfcare.netlify.app

Would love your feedback and feature suggestions! 🙏
```

---

## 🏷️ 分类 / Topics

选择以下分类：
- **Health & Fitness**
- **Productivity** (or **Quantified Self**)
- **Open Source**
- **Web App**
- **Medical**

---

## 🖼️ 图片素材清单

| 用途 | 尺寸 | 文件 | 状态 |
|------|------|------|------|
| PH 图标 | 240×240 | `assets/images/icon-240.png` | ✅ 已就绪 |
| PH 封面图 (OG) | 1200×630 | 用 `landing/og-image-generator.html` 生成 | ⚠️ 需更新后重新生成 |
| 截图 1 — 首页仪表盘 | 1284×2778 | 真机/模拟器截图 | ❌ 待制作 |
| 截图 2 — 肺功能检查 | 1284×2778 | 真机/模拟器截图 | ❌ 待制作 |
| 截图 3 — 症状评分 CAT | 1284×2778 | 真机/模拟器截图 | ❌ 待制作 |
| 截图 4 — 趋势图表 | 1284×2778 | 真机/模拟器截图 | ❌ 待制作 |
| 截图 5 — OCR 识别 | 1284×2778 | 真机/模拟器截图 | ❌ 待制作 |
| 截图 6 — 照片档案 | 1284×2778 | 真机/模拟器截图 | ❌ 待制作 |

> **截图制作方法**：启动 `npx expo start --web`，浏览器 DevTools 模拟 iPhone 14 Pro Max 尺寸后截取。

---

## 🔗 链接

| 链接 | URL | 说明 |
|------|-----|------|
| 在线演示 | https://copd-selfcare.netlify.app | ✅ 已部署 |
| GitHub | https://github.com/gongshuai888/copd-tracker | ⚡ 运行 `setup-github.bat` 即可推送 |
| 隐私政策 | `privacy/index.html` 或 `landing/privacy-policy/index.html` | ✅ 本地已就绪 |

---

## ⏰ 发布前检查清单

### ⚡ 本周必须完成

- [x] **Git 提交已完成**（141 files, commit: `f55e007`）
- [ ] **运行 `setup-github.bat`** 完成 GitHub 推送
  ```bash
  cd D:\copdAPP
  setup-github.bat
  ```
  → 仓库地址：`https://github.com/gongshuai888/copd-tracker`
- [ ] **更新隐私政策 URL** 中的 GitHub Pages 地址
- [ ] **生成 OG 封面图**：打开 `landing/og-image-generator.html` → 下载 → 保存为 `landing/og-image.png`
- [ ] **制作 6 张截图**：真机或 Web 模拟器截取（参考 `docs/SCREENSHOT-GUIDE.md`）

### 📱 截图推荐文案标注

| 截图 | 标注文案 |
|------|---------|
| 首页 | "12 大模块 · 智能评估 · 一目了然" |
| 肺功能 | "20+ 指标 · 四级分层 · 专业记录" |
| CAT 评分 | "CAT + mMRC · 国际标准 · 科学评估" |
| 趋势图 | "血氧 · 心率 · 趋势可视化追踪" |
| OCR 识别 | "粘贴报告 · 秒级识别 · 告别手动录入" |
| 照片档案 | "拍照存档 · 检查报告永不丢失" |

### 📢 发布当天

- [ ] **最佳发布时间**：太平洋时间 00:01 AM（北京时间 15:01）
- [ ] **推荐日期**：周二、周三或周四（避开周末）
- [ ] 邀请朋友在发布后 **1 小时内** 点赞评论
- [ ] 发布后立即发送第一条评论（见上方 🎯 第一句话）

### 📣 发布后分享渠道

| 平台 | 内容 | 链接 |
|------|------|------|
| Twitter/X | 产品介绍 + 截图 + 链接 | https://x.com |
| Reddit r/COPD | 分享给 COPD 患者群体 | https://reddit.com/r/COPD |
| Hacker News | Show HN 帖 | https://news.ycombinator.com |
| 微信/朋友圈 | 中文介绍 + 二维码 | — |
| 知乎 | 产品介绍文章 | https://zhihu.com |

---

## 📝 Product Hunt 发布页面填写参考

### 产品名称
```
COPD Self-Management
```

### Tagline
```
Your offline-first COPD health tracker. 12 modules, 100% private.
```

### 描述（英文 — PH 官方语言）
```
A free, offline-first COPD self-management app with 12 tracking modules. 100% local storage, zero data upload. Track lung function, SpO₂, symptoms, medications, and more.

Key features: OCR report recognition, trend charts, health screenings (PHQ-2/GAD-2/SARC-F), GOLD 2026 risk assessment, photo gallery, action plan, vaccination tracker, smart reminders.

Try the live demo: https://copd-selfcare.netlify.app
```

### 第一张封面图建议
使用 OG Image (1200×630)，标题居中：
- 绿色渐变背景
- 肺部图标
- "COPD Self-Management"
- Tagline: "Offline-First Health Tracker | 12 Modules · 100% Private"
