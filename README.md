# 🌾 Farm to Table - Smart Agricultural Marketplace & AI Platform 🇱🇰

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Uploads-3B5998?style=flat-square&logo=cloudinary)](https://cloudinary.com/)

An end-to-end digital marketplace and smart agricultural platform built to eliminate middleman markups in Sri Lanka by directly connecting local farmers with consumers, hotels, restaurants, and logistics providers.

---

## ✨ Key Features

- 🌾 **Direct Farmer-to-Consumer & B2B Trade**: Eliminates middlemen to ensure higher profits for farmers and lower prices for hotels/consumers.
- 🤖 **AI Crop Health Diagnostic**: Powered by Gemini AI image analysis for instant disease detection.
- 📈 **Wholesale Price Analytics**: Track daily pricing trends across central markets.
- ☁️ **Cloudinary Image Storage**: Instant cloud uploading for crop photos, disease scans, and delivery receipts.
- 🏨 **Hotel RFQs & Subscriptions**: Bulk bidding and automated recurring crop supply for hotel chains.
- 🚚 **Proof of Delivery (POD)**: Driver signature and photo confirmation for orders.
- 🌐 **Bi-lingual Interface**: Seamless support for Sinhala (සිංහල) and English (🌐).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4, Lucide Icons
- **Database**: MongoDB with Mongoose ORM
- **Media Uploads**: Cloudinary SDK (`/api/upload`)
- **AI Integration**: Google Gemini API
- **Deployment**: Vercel / Node.js server

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/keshanrandula/farm2table-marketplace.git
cd farm2table-marketplace
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables Setup
Create a `.env.local` file in the root directory (refer to `.env.example`):

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dioosqpp7
CLOUDINARY_CLOUD_NAME=dioosqpp7
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
