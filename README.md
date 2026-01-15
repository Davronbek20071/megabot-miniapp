# MEGABOT Mini App

Professional Telegram Mini App version of MEGABOT with complete feature parity with the Telegram bot.

## 📋 Features

All bot features are available in the Mini App:

1. **Tekin Obunachi** - Earn money and place orders for subscribers, views, reactions
2. **Resume Builder** - Create professional resumes with multiple templates
3. **Job Search** - Find daily and monthly jobs across all regions
4. **Marketplace** - Buy and sell products with commission system
5. **Books & Competitions** - Read books and participate in competitions
6. **Premium** - Premium subscription with extended features
7. **Admin Panel** - Complete bot statistics and management

## 🏗️ Architecture

```
miniapp/
├── backend/          # FastAPI backend
│   ├── main.py      # Main FastAPI app with Telegram auth
│   ├── api/         # API endpoints for each feature
│   │   ├── tekin.py
│   │   ├── jobs.py
│   │   ├── resume.py
│   │   ├── marketplace.py
│   │   ├── books.py
│   │   ├── premium.py
│   │   └── admin_api.py
│   └── requirements.txt
│
└── frontend/         # React + TypeScript + Vite
    ├── src/
    │   ├── pages/   # All feature pages
    │   ├── components/
    │   ├── store/   # Zustand state management
    │   └── api/     # Axios API client
    └── package.json
```

## 🚀 Installation

### Backend Setup

```bash
cd miniapp/backend

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:main --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd miniapp/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update API URL in .env
# VITE_API_URL=http://localhost:8000/api

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔐 Telegram WebApp Integration

The app uses Telegram WebApp SDK for authentication:

1. User opens Mini App from Telegram
2. Frontend reads `initData` from Telegram WebApp
3. Sends to backend `/api/auth/validate` endpoint
4. Backend validates using bot token
5. Returns user data and JWT token
6. Token used for all subsequent API calls

## 🎨 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **API Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Telegram**: @telegram-apps/sdk

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (reuses existing bot database)
- **Auth**: Telegram WebApp initData validation
- **CORS**: Enabled for Mini App

## 📱 Pages

1. **Home** (`/`) - Dashboard with quick actions and stats
2. **Tekin Obunachi** (`/tekin`) - Earnings and orders management
3. **Resume** (`/resume`) - Resume builder with templates
4. **Jobs** (`/jobs`) - Job listings (daily and monthly)
5. **Marketplace** (`/market`) - Product listings and orders
6. **Books** (`/books`) - Book competitions
7. **Premium** (`/premium`) - Premium plans and subscription
8. **Admin** (`/admin`) - Admin panel (admin only)

## 🔧 Configuration

### Backend `.env`
```env
BOT_TOKEN=your_bot_token
ADMIN_ID=your_admin_id
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000/api
```

## 📦 Deployment

### Backend
```bash
cd miniapp/backend
uvicorn main:main --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd miniapp/frontend
npm run build
# Deploy 'dist' folder to your hosting
```

### Telegram Bot Menu Button
Add Mini App URL to your bot's menu button using BotFather:
```
/setmenubutton
@YourBotUsername
https://your-miniapp-url.com
```

## 🎯 Features Implementation Status

✅ All core features implemented
✅ Telegram WebApp authentication
✅ Responsive mobile-first design
✅ Smooth animations and transitions
✅ Complete API integration
✅ State management with Zustand
✅ Modern UI with Tailwind v4

## 🔄 API Endpoints

- `POST /api/auth/validate` - Validate Telegram auth
- `GET /api/tekin/*` - Tekin Obunachi endpoints
- `GET /api/jobs/*` - Jobs endpoints
- `GET /api/resume/*` - Resume endpoints
- `GET /api/market/*` - Marketplace endpoints
- `GET /api/books/*` - Books endpoints
- `GET /api/premium/*` - Premium endpoints
- `GET /api/admin/*` - Admin endpoints

## 👨‍💻 Development

```bash
# Backend
cd miniapp/backend
uvicorn main:main --reload

# Frontend (in another terminal)
cd miniapp/frontend
npm run dev
```

Frontend will be available at `http://localhost:3000`
Backend API at `http://localhost:8000`

## 📝 Notes

- The backend reuses the existing bot database (`bot_database.db`)
- All bot handlers and database functions are imported and used directly
- No code duplication - single source of truth
- Full feature parity with Telegram bot
- Mobile-optimized UI/UX
- Fast and responsive

## 🎨 Design System

**Colors:**
- Primary: Purple (#8B5CF6)
- Secondary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Danger: Red (#EF4444)

**Typography:**
- Font: Inter

**Components:**
- Cards with rounded corners
- Gradient backgrounds
- Smooth transitions
- Modern shadows

## 🚀 Next Steps

1. Deploy backend to production server
2. Deploy frontend to hosting (Vercel/Netlify)
3. Configure Telegram Bot menu button with Mini App URL
4. Test all features in Telegram
5. Monitor and optimize performance

## ⚡ Performance

- Code splitting for optimal loading
- Lazy loading of pages
- Optimized bundle size
- Fast API responses
- Responsive design

---

Built with ❤️ for MEGABOT users