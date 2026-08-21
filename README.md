<div align="center">

# 💱 Currency Exchange — تبدیل ارز

**نرخ لحظه‌ای ارزهای بازار آزاد ایران با بروزرسانی خودکار هر ۳۰ ثانیه**

**Live Iranian free-market currency rates with auto-refresh every 30 seconds**

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[ویژگی‌ها](#-ویژگیها--features) •
[نصب و راه‌اندازی](#-نصب-و-راهاندازی--installation) •
[ساختار پروژه](#-ساختار-پروژه--project-structure)

</div>

---

## 📝 توضیحات — Description

<details open>
<summary>🇮🇷 فارسی</summary>

**تبدیل ارز** یک وب اپلیکیشن مدرن برای تبدیل و پیگیری نرخ ارز با **نرخ بازار آزاد ایران** است. شامل مبدل، تابلوی نرخ (خرید/فروش)، آرشیو تاریخی و نمودار روند قیمت.

ارز پایه **ریال ایران** است و ده‌ها ارز پرکاربرد (دلار، یورو، پوند، لیر، درهم، و …) پشتیبانی می‌شوند. امکان نمایش به **ریال** یا **تومان** وجود دارد.

</details>

<details>
<summary>🇬🇧 English</summary>

**Currency Exchange** is a modern web app for converting and tracking currencies using **Iran free-market rates**. It includes a converter, live buy/sell board, historical archive, and price charts.

Base currency is **Iranian Rial (IRR)** with many major world currencies. Display can switch between **Rial** and **Toman**.

</details>

---

## ✨ ویژگی‌ها — Features

- 🌐 **دو زبانه** — فارسی (RTL) و انگلیسی (LTR)
- 💵 **نرخ بازار آزاد** — با fallback به نرخ رسمی
- 🔄 **بروزرسانی خودکار هر ۳۰ ثانیه**
- 🎯 **مبدل ارز** — تبدیل بین ارزها با نمایش نتایج پرکاربرد (+ نمایش بیشتر)
- 📊 **تابلوی نرخ** — خرید و فروش لحظه‌ای
- 🗂️ **آرشیو** — نرخ‌های تاریخی ۷ / ۳۰ / ۹۰ روز
- 📈 **نمودار** — روند قیمت با Recharts
- 🪙 **سکه و طلا** — امامی، بهار آزادی، نیم، ربع، گرمی
- 💴 **ریال / تومان** — سوییچ واحد (با همگام‌سازی مبلغ وقتی مبدأ ریال است)
- 🕐 **ساعت تهران + ساعت محلی**
- 📲 **PWA** — Service Worker، کش آفلاین، قابل نصب
- 🎨 **UI مدرن** — Glassmorphism، تم تیره، واکنش‌گرا

---

## 🛠️ تکنولوژی‌ها — Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2 | UI |
| **TypeScript** | 5.9 | Type safety |
| **Vite** | 7.3 | Build |
| **Tailwind CSS** | 4.1 | Styles |
| **Recharts** | 2.x | Charts |
| **Vazirmatn** | — | Persian font |

---

## 🚀 نصب و راه‌اندازی — Installation

### پیش‌نیازها
- Node.js 18+

```bash
git clone https://github.com/masoudkelaye/Currency-exchange.git
cd Currency-exchange

npm install
npm run dev
```

آدرس پیش‌فرض: `http://localhost:5173`

### متغیر محیطی اختیاری
```bash
VITE_LIVE_RATES_URL=https://your-domain.com/rates.json npm run build
```

### Build
```bash
npm run build    # خروجی تک‌فایل در dist/
npm run preview
```

---

## 📂 ساختار پروژه — Project Structure

```
Currency-exchange/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── src/
│   ├── main.tsx              # ورود + ثبت Service Worker
│   ├── App.tsx               # UI (تب‌ها، مبدل، نرخ، آرشیو، نمودار)
│   ├── index.css
│   ├── i18n.ts               # ترجمه‌ها + لیست ارز و سکه
│   ├── useExchangeRates.ts   # هوک نرخ + آرشیو
│   ├── registerSW.ts
│   ├── vite-env.d.ts
│   └── utils/
│       └── cn.ts
└── public/
    ├── manifest.json
    └── sw.js
```

---

## 
---

## 📲 نصب به عنوان اپ (PWA)

- **iOS Safari:** Share → Add to Home Screen  
- **Android Chrome:** منو → Install app / Add to Home Screen  
- **Desktop:** آیکون Install در نوار آدرس  

---

## 🌐 استقرار — Deployment

- **Vercel / Netlify:** import ریپو  
- **GitHub Pages:** `npm run build` سپس محتوای `dist/`  
- هر هاست استاتیک با فایل تک‌صفحه‌ای `dist/index.html`

---

## 📄 لایسنس — License

[MIT](./LICENSE)

---

<div align="center">

ساخته شده با ❤️ برای کاربران ایرانی

Made with ❤️ for Iranian users

</div>
