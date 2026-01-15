# MEGABOT Mini App - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Python 3.11+
- Node.js 20+
- Nginx (for reverse proxy)
- SSL certificate for HTTPS

### Backend Deployment

#### 1. Install Dependencies
```bash
cd miniapp/backend
pip install -r requirements.txt
```

#### 2. Configure Environment
Create `.env` file:
```env
BOT_TOKEN=your_actual_bot_token
ADMIN_ID=your_admin_telegram_id
```

#### 3. Run with Gunicorn
```bash
# Install gunicorn
pip install gunicorn

# Run production server
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### 4. Systemd Service (Linux)
Create `/etc/systemd/system/megabot-api.service`:
```ini
[Unit]
Description=MEGABOT Mini App API
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/MEGABOT/miniapp/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable megabot-api
sudo systemctl start megabot-api
```

### Frontend Deployment

#### 1. Build Production Bundle
```bash
cd miniapp/frontend

# Update API URL in .env
echo "VITE_API_URL=https://your-api-domain.com/api" > .env

# Build
npm run build
```

#### 2. Deploy to Hosting

**Option A: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option C: Static File Server**
```bash
# Copy dist folder to your web server
cp -r dist/* /var/www/miniapp/
```

### Nginx Configuration

#### API Reverse Proxy
```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Frontend Static Files
```nginx
server {
    listen 80;
    server_name miniapp.your-domain.com;
    root /var/www/miniapp;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### SSL/HTTPS Setup

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.your-domain.com -d miniapp.your-domain.com
```

### Telegram Bot Configuration

#### 1. Set Menu Button
Use BotFather:
```
/setmenubutton
@YourBotUsername
https://miniapp.your-domain.com
```

#### 2. Set Web App
Alternative: Add Web App button in bot keyboard:
```python
from aiogram.types import WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup

keyboard = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(
        text="🚀 Open Mini App",
        web_app=WebAppInfo(url="https://miniapp.your-domain.com")
    )]
])
```

### Environment Variables

**Production Backend `.env`:**
```env
BOT_TOKEN=your_bot_token
ADMIN_ID=your_admin_id
CORS_ORIGINS=https://miniapp.your-domain.com
```

**Production Frontend `.env`:**
```env
VITE_API_URL=https://api.your-domain.com/api
```

### Security Checklist

- [ ] HTTPS enabled for both frontend and backend
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database properly backed up
- [ ] Rate limiting implemented
- [ ] Telegram initData validation working
- [ ] Admin endpoints protected

### Monitoring

#### 1. Backend Logs
```bash
# View systemd logs
sudo journalctl -u megabot-api -f

# Or application logs
tail -f /path/to/logs/api.log
```

#### 2. Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for user session replay
- Google Analytics for usage stats

### Performance Optimization

#### Backend
```bash
# Use more workers based on CPU cores
gunicorn main:app -w $(nproc) -k uvicorn.workers.UvicornWorker
```

#### Frontend
- Already optimized with:
  - Code splitting
  - Lazy loading
  - Tailwind CSS tree-shaking
  - Vite optimizations

### Backup Strategy

```bash
# Database backup
cp /path/to/bot_database.db /backups/bot_database_$(date +%Y%m%d).db

# Automated daily backup (crontab)
0 2 * * * cp /path/to/bot_database.db /backups/bot_database_$(date +\%Y\%m\%d).db
```

### Testing in Production

1. **Telegram Test**:
   - Open bot in Telegram
   - Click menu button
   - Verify Mini App opens
   - Test all features

2. **API Test**:
   ```bash
   curl https://api.your-domain.com/api/health
   ```

3. **Performance Test**:
   - Use Lighthouse for frontend
   - Use k6 or locust for backend

### Troubleshooting

**Issue: Mini App won't open**
- Check HTTPS is enabled
- Verify domain in Telegram bot settings
- Check CORS configuration

**Issue: API errors**
- Check backend logs
- Verify environment variables
- Test API endpoints directly

**Issue: Authentication fails**
- Verify BOT_TOKEN is correct
- Check Telegram WebApp integration
- Test initData validation

### Scaling

**Horizontal Scaling:**
```bash
# Run multiple backend instances
# Use load balancer (nginx, HAProxy)
# Configure database connection pooling
```

**Database:**
```bash
# If SQLite becomes bottleneck, migrate to PostgreSQL
# Update database.py connection string
# Run migrations
```

### Maintenance

**Regular Tasks:**
- Monitor logs daily
- Check error rates
- Update dependencies monthly
- Backup database daily
- Review security patches

**Updates:**
```bash
# Backend
git pull
pip install -r requirements.txt
sudo systemctl restart megabot-api

# Frontend
git pull
npm install
npm run build
# Deploy new build
```

---

## 🎯 Quick Deployment Checklist

Backend:
- [ ] Install dependencies
- [ ] Configure .env
- [ ] Run with gunicorn
- [ ] Setup systemd service
- [ ] Configure nginx reverse proxy
- [ ] Enable HTTPS

Frontend:
- [ ] Update API URL
- [ ] Build production bundle
- [ ] Deploy to hosting
- [ ] Configure nginx
- [ ] Enable HTTPS

Telegram:
- [ ] Set menu button URL
- [ ] Test Mini App opening
- [ ] Verify authentication
- [ ] Test all features

Done! 🎉