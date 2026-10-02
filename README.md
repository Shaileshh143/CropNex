# CropNex.in — Online Farm-to-Home & Wholesale Agricultural Marketplace
### Fullstack E-Commerce Platform (Amazon-Style Architecture)

> **Platform**: CropNex India — Direct Producer & Farm Fresh E-Commerce Store  
> **Tech Stack**: Next.js 15 (React 19, TypeScript), Tailwind CSS, MongoDB (Mongoose), NextAuth.js (Google OAuth 2.0)

---

## 🌾 What is CropNex.in?

**CropNex.in** is an Amazon-style e-commerce marketplace connecting rural farm producers directly with household consumers and bulk buyers. Customers enjoy fresh produce at direct-from-farm pricing with fast delivery, while farmers sell directly with zero middleman commissions.

### 🌟 Amazon-Style Core Features
1. **Amazon Marketplace as Default Homepage (`/`)**:
   - Hero banner carousel for farm produce deals and sales.
   - 4-in-1 category quick-access cards (Fresh Vegetables, Daily Fruits, Grains & Dals, Certified Organic).
   - "Today's Deals" lightning deals strip.
   - Amazon product cards with `#1 Best Seller`, `Limited time deal`, star ratings, review counts, strikethrough M.R.P., discount percentages, and Prime Free Delivery badges.
   - Amazon Yellow `Add to Cart` and `Buy Now` buttons.
   - Quick-view product modal.
2. **Amazon Navigation Bar**:
   - Top dark navigation with CropNex logo, "Deliver to [City Pincode]" location modal, central search bar with category dropdown, language selector, "Hello, Sign In / Account & Lists", "Returns & Orders", and Cart counter.
   - Sub-navbar category strip (Fresh Vegetables, Daily Fruits, Grains, Spices, Pulses, Organic Store, Today's Deals, Sell on CropNex).
3. **Shopping Cart & Checkout Drawer**:
   - Slide-out cart with subtotal calculation, free delivery progress, and direct checkout modal (Address, UPI / Amazon Pay / COD payment).
4. **Returns & Orders (`/orders`)**:
   - Amazon-style "Your Orders" dashboard with package tracking, invoice download, and re-order buttons.
5. **CropNex Seller Central (`/seller`)**:
   - Dashboard for farmers and suppliers to add products and fulfill dispatch orders.
6. **Authentication & Security (`/auth/signin`)**:
   - Sign in with Google (OAuth 2.0) + 1-Click Instant Demo Login.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your MongoDB URI and Google OAuth credentials in `.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/cropnex
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cropnex_secure_jwt_secret_token_production_2026

# Google Cloud Console OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
