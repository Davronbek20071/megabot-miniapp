# MEGABOT Mini App - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd miniapp/backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "BOT_TOKEN=your_bot_token_here" > .env
echo "ADMIN_ID=your_telegram_id" >> .env

# Run backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: `http://localhost:8000`

### Step 2: Frontend Setup (3 minutes)

```bash
# Open new terminal, navigate to frontend
cd miniapp/frontend

# Install dependencies (first time only)
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Run development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

### Step 3: Configure Telegram Bot

1. Open BotFather in Telegram
2. Send `/setmenubutton`
3. Select your bot
4. Enter your Mini App URL (e.g., `https://your-domain.com` or for testing use ngrok)

### Testing Locally with Telegram

Since Telegram requires HTTPS, use ngrok for local testing:

```bash
# Install ngrok: https://ngrok.com/download

# Expose frontend
ngrok http 3000
# Copy the https URL (e.g., https://abc123.ngrok.io)

# Expose backend (in another terminal)
ngrok http 8000
# Copy the https URL for API

# Update frontend/.env with ngrok backend URL
echo "VITE_API_URL=https://your-backend-ngrok-url.ngrok.io/api" > frontend/.env

# Restart frontend
npm run dev

# Set ngrok frontend URL in BotFather
# /setmenubutton -> @YourBot -> https://your-frontend-ngrok-url.ngrok.io
```

## ✅ Verify Setup

1. **Backend Health Check**:
   ```bash
   curl http://localhost:8000/api/health
   # Should return: {"status":"healthy","database":"connected"}
   ```

2. **Frontend**:
   - Open `http://localhost:3000` in browser
   - You should see the MEGABOT Mini App interface

3. **Telegram**:
   - Open your bot in Telegram
   - Click the menu button
   - Mini App should open

## 🎯 All Features Available

✅ **Tekin Obunachi** - Pul ishlash va buyurtma berish
✅ **Resume Builder** - Professional rezyume yaratish  
✅ **Job Search** - Kunlik va oylik ishlar
✅ **Marketplace** - Mahsulot sotish va xarid qilish
✅ **Books** - Kitob o'qish va musobaqalar
✅ **Premium** - Premium obuna
✅ **Admin Panel** - To'liq boshqaruv paneli

## 🐛 Troubleshooting

**Backend won't start:**
- Check Python version (3.11+)
- Ensure BOT_TOKEN is set in .env
- Verify database file exists: `../bot_database.db`

**Frontend won't start:**
- Check Node.js version (20+)
- Run `npm install` again
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**Authentication fails:**
- Verify BOT_TOKEN is correct
- Check API URL in frontend .env
- Ensure backend is running
- Check browser console for errors

**Mini App won't open in Telegram:**
- Ensure URL is HTTPS (use ngrok for testing)
- Verify menu button URL in BotFather
- Check CORS settings in backend
- Try clearing Telegram cache

## 📦 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment guide.

Quick production checklist:
- [ ] Deploy backend to server with HTTPS
- [ ] Deploy frontend to hosting (Vercel/Netlify)
- [ ] Update .env files with production URLs
- [ ] Configure Telegram menu button with production URL
- [ ] Test all features

## 🔧 Development Tips

**Hot Reload:**
- Backend: uvicorn auto-reloads on file changes
- Frontend: Vite auto-reloads on file changes

**Debug Mode:**
```bash
# Backend with debug logs
uvicorn main:app --reload --log-level debug

# Frontend with source maps
npm run dev
```

**Database Changes:**
- Backend uses existing `bot_database.db`
- Any changes to bot database reflect in Mini App
- No separate database needed

## 📱 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS v4 (styling)
- Zustand (state management)
- Axios (API client)
- Framer Motion (animations)
- Lucide React (icons)
- React Router (routing)

**Backend:**
- FastAPI (Python web framework)
- SQLite (existing bot database)
- Uvicorn (ASGI server)
- Telegram WebApp authentication

## 💡 Next Steps

1. **Customize Design**: Edit `frontend/src/index.css` for colors and styles
2. **Add Features**: Create new pages in `frontend/src/pages/`
3. **API Endpoints**: Add new endpoints in `backend/api/`
4. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)

---

Need help? Check:
- [README.md](./README.md) - Complete documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- Telegram: @YourSupportBot