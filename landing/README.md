<p align="center">
  <img src="assets/images/icon.png" width="120" alt="COPD App Icon">
</p>

<h1 align="center">慢阻肺自我管理助手</h1>
<h3 align="center">COPD Self-Management Assistant</h3>

<p align="center">
  <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue" alt="Platform">
  <img src="https://img.shields.io/badge/framework-React%20Native%20%7C%20Expo%2054-61DAFB" alt="Framework">
  <img src="https://img.shields.io/badge/language-TypeScript-3178C6" alt="Language">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome">
</p>

<p align="center">
  <strong>🫁 A free, offline-first COPD self-management app with 11 tracking modules.</strong><br>
  100% local storage. Zero data upload. Your health, your data, your control.
</p>

---

## ✨ Features

- 🔒 **100% Local Storage** — SQLite on your device, no cloud, no signup
- 🤖 **OCR Smart Recognition** — Snap or paste medical reports, auto-extract 20+ indicators
- 📊 **Trend Charts** — Auto-generated line charts for SpO₂, heart rate, weight, and more
- 🔔 **Smart Reminders** — Daily SpO₂, monthly CAT assessment, follow-up alerts
- 📤 **Data Export** — JSON backup anytime, anywhere
- 🌐 **Offline First** — No internet required for any feature
- 🆓 **Completely Free** — No ads, no subscriptions, no in-app purchases

## 🧩 11 Tracking Modules

| Module | Description |
|--------|-------------|
| 🫁 Pulmonary Function | 20 indicators, 4-tier classification, bronchodilator test |
| 🔬 Airway Inflammation | FeNO, blood EOS, sputum EOS/NEUT |
| 📋 Symptom Scoring | CAT (8 questions, 0-40) + mMRC (0-4 scale) |
| 🏃 Exercise Tolerance | 6-minute walk test + Borg dyspnea score |
| 💓 Daily Vitals | SpO₂, heart rate, respiratory rate |
| ⚖️ Nutrition & Weight | BMI auto-calculation from profile height |
| 🚨 Exacerbation | Annual risk assessment (low/medium/high) |
| 💊 Medication | Rescue inhaler frequency + inhalation technique scoring |
| 🏥 Comorbidity | PAP, bone density T-score, blood glucose, lipids |
| 🚭 Smoking Cessation | FTND 6-question nicotine dependence scale |
| 😴 Sleep Monitoring | Nocturnal SpO₂, ODI, T90, heart rate |

## 📸 Screenshots

<p align="center">
  <em>Coming soon — screenshots will be added after App Store submission</em>
</p>

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React Native + Expo 54 | Cross-platform mobile framework |
| TypeScript | Type-safe development |
| SQLite (expo-sqlite) | Local database |
| React Native Paper | Material Design UI components |
| react-native-chart-kit | Trend charts |
| date-fns | Date formatting |
| expo-notifications | Local reminders |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/copd-tracker/copd-app.git
cd copd-app

# Install dependencies
npm install

# Start development server
npx expo start

# Type check
npm run typecheck
```

## 📱 Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

## 📂 Project Structure

```
├── app/                    # Expo Router pages (47 files)
│   ├── (tabs)/             # 4 bottom tabs
│   ├── record/             # 11 modules × 3 pages each
│   └── _layout.tsx         # Root layout + 39 routes
├── src/
│   ├── components/         # Shared UI components
│   ├── database/           # SQLite schema + 12 repositories
│   ├── services/           # OCR engine
│   ├── types/              # TypeScript interfaces
│   └── constants/          # Normal ranges + config
├── assets/images/          # App icon + splash screen
├── docs/                   # Documentation (Chinese)
└── landing/                # Product Hunt launch page
```

## ⚠️ Medical Disclaimer

This app is for **health management reference only**. It does **not** constitute medical diagnosis or treatment advice. Always consult your physician. The app developer assumes no liability for any medical decisions made using this app.

## 📄 License

MIT © 2026 COPD Self-Management Assistant

---

<p align="center">
  <sub>Built with ❤️ for COPD patients worldwide</sub>
</p>
