# 🩸 Winning With Warfarin

**Balance your blood. Master your meals.**

Winning With Warfarin is a mobile app built with Expo and React Native to help users on warfarin track INR levels and vitamin K intake. It offers logging, nutrition tracking, and intelligent analysis to maintain INR stability.

---

## 🚀 Features

- Log INR readings with timestamped history and charting
- Search vitamin K, protein, fiber, and fat content of foods
- Scan barcodes and voice log meals
- Auto-analyze dietary impact on INR fluctuations
- Export summaries to PDF or CSV
- Works offline with local storage
- Built-in recipe builder and food diary
- GitHub Actions for CI with Expo

---

## 📦 Tech Stack

- React Native (Expo SDK 53)
- AsyncStorage / SQLite
- USDA + Open Food Facts APIs
- OpenAI API integration
- Victory Native Charts
- GitHub Actions (CI)
- PDF export with `react-native-pdf-lib` and `react-native-view-shot`

---

## 🛠️ Setup

1. Clone the repo:
   ```bash
   git clone git@github.com:chope-blaze/winning-with-warfarin.git
   cd winning-with-warfarin
