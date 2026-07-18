<div align="center">

# 💱 Currency Converter — تبدیل ارز

**نرخ لحظه‌ای ارزهای بازار آزاد ایران با بروزرسانی خودکار هر ۳۰ ثانیه**

**Live Iranian free-market currency rates with auto-refresh every 30 seconds**

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[ویژگی‌ها](#-ویژگیها--features) •
[نصب و راه‌اندازی](#-نصب-و-راهاندازی--installation) •
[ساختار پروژه](#-ساختار-پروژه--project-structure) •
[API](#-منبع-داده--data-source)

</div>

---

## 📝 توضیحات — Description

<details open>
<summary>🇮🇷 فارسی</summary>

**تبدیل ارز** یک وب اپلیکیشن مدرن و واکنش‌گرا برای تبدیل ارزهای پرکاربرد دنیا با استفاده از **نرخ لحظه‌ای بازار آزاد ایران** است. این برنامه برخلاف بسیاری از سرویس‌های مشابه، به جای نرخ دولتی، از نرخ واقعی بازار آزاد استفاده می‌کند.

ارز پایه این برنامه **ریال ایران** است و ۱۰ ارز پرکاربرد دنیا در آن پشتیبانی می‌شوند: دلار آمریکا، یورو، پوند انگلیس، فرانک سوئیس، ین ژاپن، دلار کانادا، دلار استرالیا، یوآن چین، لیر ترکیه و درهم امارات.

</details>

<details>
<summary>🇬🇧 English</summary>

**Currency Converter** is a modern, responsive web application for converting major world currencies using **live rates from Iran's free market**. Unlike many similar services, this app uses real free-market rates instead of official government rates.

The base currency is **Iranian Rial (IRR)**, and 10 major world currencies are supported: US Dollar, Euro, British Pound, Swiss Franc, Japanese Yen, Canadian Dollar, Australian Dollar, Chinese Yuan, Turkish Lira, and UAE Dirham.

</details>

---

## ✨ ویژگی‌ها — Features

- 🌐 **دو زبانه** — پشتیبانی کامل از فارسی (راست‌چین) و انگلیسی (چپ‌چین) با تغییر فوری زبان
- 💵 **نرخ بازار آزاد** — استفاده از نرخ واقعی بازار آزاد ایران (نه نرخ دولتی)
- 🔄 **بروزرسانی خودکار هر ۳۰ ثانیه** — نمایش شمارنده تا بروزرسانی بعدی
- 🎯 **مبدل ارز هوشمند** — تبدیل سریع بین هر دو ارز با نمایش نرخ تبدیل دوطرفه
- 📊 **تابلوی قیمت‌ها** — نمایش نرخ لحظه‌ای تمام ارزها به صورت گرید دو ستونه
- 🎨 **طراحی مدرن** — رابط کاربری زیبا با Glassmorphism و تم تیره
- 📱 **کاملاً واکنش‌گرا** — سازگار با موبایل، تبلت و دسکتاپ
- 🔤 **نام کامل ارزها** — نام‌های کامل و فارسی مانند «دلار آمریکا» و «پوند انگلیس»
- ⚡ **سریع و بهینه** — ساخته شده با Vite 7 و React 19
- 📲 **PWA آماده** — قابل نصب به عنوان اپلیکیشن روی موبایل و دسکتاپ
- 📱 **کاملاً واکنش‌گرا** — بهینه برای تمام اندازه‌های صفحه (موبایل، تبلت، دسکتاپ)
- 🔲 **حالت تمام‌صفحه** — پشتیبانی از Safe Area برای دستگاه‌های Notch‌دار

---

## 🛠️ تکنولوژی‌های استفاده شده — Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2 | کتابخانه UI |
| **TypeScript** | 5.9 | تایپ‌سیف بودن کد |
| **Vite** | 7.3 | ابزار ساخت و توسعه |
| **Tailwind CSS** | 4.1 | استایل‌دهی |
| **Vazirmatn Font** | — | فونت فارسی از Google Fonts |
| **Baha24 API** | — | منبع نرخ‌های بازار آزاد |

---

## 🚀 نصب و راه‌اندازی — Installation

### پیش‌نیازها — Prerequisites

- Node.js نسخه `18` یا بالاتر
- npm یا yarn

### نصب — Install

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/currency-converter.git
cd currency-converter

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

برنامه روی آدرس `http://localhost:5173` اجرا خواهد شد.

### ساخت نسخه پروداکشن — Build for Production

```bash
npm run build
```

خروجی در پوشه `dist/` به صورت یک فایل HTML تکی (`index.html`) ایجاد می‌شود که می‌تواند روی هر سرور وب استاتیک یا GitHub Pages میزبانی شود.

### پیش‌نمایش نسخه بیلد — Preview Production Build

```bash
npm run preview
```

---

## 📂 ساختار پروژه — Project Structure

```
currency-converter/
├── index.html              # صفحه اصلی با تنظیمات RTL و فونت فارسی
├── package.json            # وابستگی‌های پروژه
├── tsconfig.json           # تنظیمات TypeScript
├── vite.config.ts          # تنظیمات Vite
├── src/
│   ├── main.tsx            # نقطه ورود برنامه
│   ├── App.tsx             # کامپوننت اصلی (مبدل + جدول نرخ‌ها)
│   ├── index.css           # استایل‌های سراسری + Tailwind
│   ├── i18n.ts             # تنظیمات دو زبانه + لیست ارزها
│   ├── useExchangeRates.ts # هوک React برای دریافت نرخ ارز
│   └── utils/
│       └── cn.ts           # ابزار کمکی classNames
└── public/                 # فایل‌های استاتیک
```

---

## 🔌 منبع داده — Data Source

این برنامه از **سیستم هوشمند ۳ لایه** برای دریافت نرخ ارز استفاده می‌کند:

### ۱. منبع اصلی: **[baha24.com](https://baha24.com)** — نرخ بازار آزاد 🟢
```
GET https://baha24.com/api/v1/price
```
- ✅ نرخ‌های لحظه‌ای بازار آزاد ایران
- ⚠️ ممکن است به دلیل CORS بلاک شود (از پروکسی استفاده می‌شود)

### ۲. منبع دوم: **[SamadiPour/rial-exchange-rates-archive](https://github.com/SamadiPour/rial-exchange-rates-archive)** — نرخ بازار آزاد 🟢
```
GET https://raw.githubusercontent.com/SamadiPour/.../gregorian/YYYY/MM/DD
```
- ✅ نرخ‌های بازار آزاد (منبع: bonbast.com)
- ✅ بدون مشکل CORS (از GitHub CDN)
- ⚠️ بروزرسانی روزانه (نه لحظه‌ای)

### ۳. منبع سوم: **[open.er-api.com](https://www.exchangerate-api.com)** — نرخ رسمی 🟡
```
GET https://open.er-api.com/v6/latest/USD
```
- ✅ پشتیبانی کامل از CORS و همیشه در دسترس
- ⚠️ نرخ رسمی بانک مرکزی (نه بازار آزاد)

### 🔄 سیستم Fallback خودکار
برنامه به ترتیب از هر ۳ منبع تلاش می‌کند. اگر نرخ بازار آزاد در دسترس نباشد، از نرخ رسمی استفاده و نشانگر زرد رنگ نمایش داده می‌شود.

### ارزهای پشتیبانی شده — Supported Currencies

| پرچم | کد | نام فارسی | نام انگلیسی |
|:---:|:---:|---|---|
| 🇮🇷 | IRR | ریال ایران | Iranian Rial |
| 🇺🇸 | USD | دلار آمریکا | US Dollar |
| 🇪🇺 | EUR | یورو اتحادیه اروپا | Euro |
| 🇬🇧 | GBP | پوند انگلیس | British Pound |
| 🇨🇭 | CHF | فرانک سوئیس | Swiss Franc |
| 🇯🇵 | JPY | ین ژاپن | Japanese Yen |
| 🇨🇦 | CAD | دلار کانادا | Canadian Dollar |
| 🇦🇺 | AUD | دلار استرالیا | Australian Dollar |
| 🇨🇳 | CNY | یوآن چین | Chinese Yuan |
| 🇹🇷 | TRY | لیر ترکیه | Turkish Lira |
| 🇦🇪 | AED | درهم امارات | UAE Dirham |

---

## 📲 نصب به عنوان اپلیکیشن — Install as App (PWA)

### 🍎 iOS (Safari)
1. سایت را در Safari باز کنید
2. دکمه Share (مربع با فلش بالا) را بزنید
3. گزینه **"Add to Home Screen"** را انتخاب کنید

### 🤖 Android (Chrome)
1. سایت را در Chrome باز کنید
2. منوی سه‌نقطه را بزنید
3. گزینه **"Add to Home Screen"** یا **"Install App"** را انتخاب کنید

### 💻 Desktop (Chrome/Edge)
1. آیکون نصب در نوار آدرس (یا منوی سه‌نقطه) را بزنید
2. **"Install"** را انتخاب کنید

پس از نصب، برنامه مانند یک اپلیکیشن بومی **تمام‌صفحه** و بدون نوار مرورگر اجرا می‌شود.

---

## 🌐 استقرار — Deployment

### GitHub Pages

```bash
npm run build
```

سپس محتوای پوشه `dist/` را روی شاخه `gh-pages` push کنید یا از GitHub Actions استفاده کنید.

### Vercel / Netlify

این پروژه بدون هیچ تنظیماتی روی Vercel و Netlify مستقر می‌شود. فقط repository را import کنید.

### هر سرور استاتیک

فایل `dist/index.html` به صورت self-contained (تک‌فایل) ساخته می‌شود و می‌تواند روی هر سرور وبی (Apache, Nginx, S3, ...) میزبانی شود.

---

## 🤝 مشارکت — Contributing

مشارکت شما با کمال میل پذیرفته می‌شود! 🙏

1. Fork کنید
2. Branch جدید بسازید: `git checkout -b feature/amazing-feature`
3. Commit کنید: `git commit -m 'feat: add amazing feature'`
4. Push کنید: `git push origin feature/amazing-feature`
5. Pull Request باز کنید

---

## 📄 لایسنس — License

این پروژه تحت لایسنس **[MIT](./LICENSE)** منتشر شده است.

This project is licensed under the **[MIT License](./LICENSE)**.

---

<div align="center">

ساخته شده با ❤️ برای کاربران ایرانی

Made with ❤️ for Iranian users

</div>
