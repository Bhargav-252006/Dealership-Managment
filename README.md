# 🛢️ DealerConnect

DealerConnect is a full-stack Dealership and Inventory Management application designed for distributors, wholesalers, and supermarkets. It provides a premium, responsive interface to seamlessly track orders, manage shop locations, and maintain product inventory.

## ✨ Features
- **Secure Authentication:** User registration and JWT-based login system for dealers.
- **Dynamic Dashboard:** Real-time statistics tracking orders, shops, companies, and product counts.
- **Order Management:** Create and manage orders with dynamic price calculations (Box vs Piece pricing) and intuitive mobile-friendly interfaces.
- **Inventory & Companies:** Categorize products (e.g., Normal Oil vs Palm/Deepam Oil), track unit sizes, and manage company affiliations.
- **Shop & Location Tracking:** Maintain a directory of shops tied to specific geographical locations.
- **Responsive Premium UI:** A beautiful, animated amber/dark-themed interface that works flawlessly on both desktop and mobile devices.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, React Router, Axios, CSS (Custom Glassmorphism & Animations)
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT)
- **Database:** PostgreSQL via Prisma ORM
- **Deployment:** Render.com (Infrastructure as Code via `render.yaml`)

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (or MySQL if you change the provider in `schema.prisma`)

### 2. Backend Setup
```bash
cd backend-node
npm install
```
Create a `.env` file in the `backend-node` directory with:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dealership"
JWT_SECRET="your_secret_key"
PORT=8000
```
Run database migrations and start the server:
```bash
npx prisma db push
npx prisma generate
node src/index.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```

## ☁️ Deployment (Render.com)
This repository is configured with a `render.yaml` Blueprint for 1-click deployment to Render.

1. Create a **PostgreSQL** database on Render and copy the *Internal Database URL*.
2. Create a **New Blueprint** on Render and connect this repository.
3. When prompted, provide your PostgreSQL URL as the `DATABASE_URL` environment variable.
4. Render will automatically deploy the Node.js backend and the React static site.

---
*Built with ❤️ for modern distribution businesses.*
