# 🗺️ శోధించు సాధించు | Shodhinchu Saadinchu
## Complete Treasure Hunt Game — Full Stack MERN Application

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Local Setup (Step by Step)](#local-setup)
5. [Running the Application](#running)
6. [How the Game Works](#game-flow)
7. [QR Code System Explained](#qr-system)
8. [Deployment Guide](#deployment)

---

## Overview

**Shodhinchu Saadinchu** is a full-stack treasure hunt game:
- **Host** creates paths (up to 12), each with 5 locations and unique clues
- **QR codes** are generated per location and printed/placed physically
- **Teams** register at the host desk, receive a PIN + path color
- **Teams** scan QR at each location to unlock the next clue
- **Host** sees real-time leaderboard and team progress

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| QR Generation | `qrcode` npm package |
| QR Scanning | `html5-qrcode` |
| Auth | JWT tokens |
| Language | Telugu (default) + English toggle |

---

## Prerequisites

Install these before proceeding:

1. **Node.js v18+**: https://nodejs.org/
   ```bash
   node --version   # should show v18+
   npm --version    # should show v9+
   ```

2. **MongoDB** (choose one):
   - **Option A - Local**: https://www.mongodb.com/try/download/community
   - **Option B - Free Cloud**: https://www.mongodb.com/atlas (recommended)

3. **Git** (optional): https://git-scm.com/

---

## Local Setup

### Step 1: Extract and navigate to project
```bash
unzip shodhinchu-saadinchu.zip
cd shodhinchu-saadinchu
```

### Step 2: Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shodhinchu-saadinchu
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shodhinchu-saadinchu

JWT_SECRET=change_this_to_a_long_random_string_min_32_chars
HOST_PASSWORD=your_host_password_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Install backend dependencies:
```bash
npm install
```

### Step 3: Setup Frontend

```bash
cd ../frontend

# Copy environment file
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Install frontend dependencies:
```bash
npm install
```

---

## Running the Application

### Terminal 1 — Backend
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
# You should see: ✅ MongoDB Connected
# You should see: 🚀 Server running on port 5000
```

### Terminal 2 — Frontend
```bash
cd frontend
npm start
# React app opens at http://localhost:3000
```

### Access the App
- **App URL**: http://localhost:3000
- **API Health**: http://localhost:5000/api/health

---

## Game Flow

### Host Setup (Before Game)

1. **Login as Host** → http://localhost:3000/host-login

2. **Create Paths** → Navigate to "Paths" tab
   - Click "Create Path"
   - Enter path number (1-12) and color (e.g., Red, Blue)
   - Fill in all 5 locations with Telugu clues
   - Submit → **QR codes auto-generated!**

3. **Print QR Codes** → Click "🖨️ QR" button on any path
   - Each place gets a unique QR code
   - Print the page and physically place each QR at its location
   - QR for Place 1 → placed AT location 1, not shown to teams before they arrive

4. **Register Teams** → Navigate to "Teams" tab
   - Enter team name, members, assign a path number
   - System generates a **PIN code** (e.g., 4823)
   - Give team: PIN + Path Color (e.g., PIN: 4823, Color: Red)

### Team Gameplay

1. **Team Login** → http://localhost:3000/team-login
   - Enter PIN + Path Color → Game starts, timer begins

2. **Current Clue** → Teams see ONLY their current clue
   - Read the Telugu clue → travel to the location

3. **Scan QR** → At the location, team scans the QR code
   - If correct location: ✅ Next clue unlocks
   - If wrong QR (wrong location): ❌ Error message

4. **Complete Hunt** → After scanning Place 5 QR
   - Completion time recorded
   - Host sees result on leaderboard immediately

---

## QR Code System Explained

### How It Works (Critical)

```
Each place has a UNIQUE validationCode (UUID like: "a1b2c3d4-...")
The QR code encodes ONLY this UUID string.

Game logic:
- Team reads clue for Place 1 → goes to Location 1
- Scans QR at Location 1 (encodes Place 1's UUID)
- Backend checks: does UUID match team's current expected place?
- YES → unlock Place 2 clue, progress recorded
- NO  → "Wrong location!" error
```

### Why QR Might Fail (and fixes)

| Problem | Solution |
|---------|----------|
| Camera permission denied | Allow camera in browser settings |
| Wrong location QR | Make sure QR for Place 1 is at Location 1 (not Place 2 QR) |
| QR damaged/blurry | Use manual code entry (printed below QR) |
| Old path deleted/recreated | New QRs generated, replace old printed ones |
| Mobile browser issue | Use Chrome on Android, Safari on iPhone |

### Manual Code Fallback
Every QR print page shows the raw UUID code below the QR image.
Teams can type this manually if QR scanning fails.

---

## Deployment Guide

### Option A: Deploy to Render.com (Free, Recommended)

#### Backend on Render
1. Create account at https://render.com
2. New → Web Service → Connect GitHub repo (or upload code)
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Environment Variables (add all from .env):
   - `MONGODB_URI` = your MongoDB Atlas URI
   - `JWT_SECRET` = your secret
   - `HOST_PASSWORD` = your password
   - `FRONTEND_URL` = https://your-frontend.vercel.app
   - `NODE_ENV` = production
5. Note your backend URL: `https://your-app.onrender.com`

#### Frontend on Vercel
1. Create account at https://vercel.com
2. New Project → Import → Upload frontend folder
3. Environment Variables:
   - `REACT_APP_API_URL` = https://your-app.onrender.com/api
   - `REACT_APP_SOCKET_URL` = https://your-app.onrender.com
4. Deploy!

### Option B: Deploy to Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Backend
cd backend
railway init
railway variables set MONGODB_URI="..." JWT_SECRET="..." HOST_PASSWORD="..." NODE_ENV="production"
railway up

# Frontend
cd ../frontend
# Set REACT_APP_API_URL to Railway backend URL
npm run build
# Deploy build folder to Vercel or Netlify
```

### Option C: VPS (Ubuntu Server)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb
sudo systemctl start mongodb

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone/upload project
cd /var/www
# upload your project files here

# Setup backend
cd shodhinchu-saadinchu/backend
cp .env.example .env
nano .env  # edit your values
npm install
pm2 start server.js --name "treasure-backend"

# Build frontend
cd ../frontend
npm install
REACT_APP_API_URL=http://your-server-ip:5000/api REACT_APP_SOCKET_URL=http://your-server-ip:5000 npm run build

# Install nginx
sudo apt install nginx
sudo nano /etc/nginx/sites-available/treasure

# Nginx config:
# server {
#   listen 80;
#   root /var/www/shodhinchu-saadinchu/frontend/build;
#   index index.html;
#   location / { try_files $uri $uri/ /index.html; }
#   location /api { proxy_pass http://localhost:5000; }
#   location /socket.io { proxy_pass http://localhost:5000; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
# }

sudo ln -s /etc/nginx/sites-available/treasure /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

pm2 startup && pm2 save
```

---

## Default Credentials

| Role | Login Method | Default |
|------|-------------|---------|
| Host | Password | `hostpassword123` |
| Team | PIN + Color | Generated during registration |

**Change `HOST_PASSWORD` in .env before production!**

---

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `sudo systemctl status mongodb`
- Check .env file exists in backend folder
- Check port 5000 is free: `lsof -i :5000`

### Frontend won't connect to backend
- Check REACT_APP_API_URL in frontend/.env
- Check backend is running on port 5000
- Check CORS: FRONTEND_URL in backend .env must match frontend URL

### QR codes not working
- Team must be at the CORRECT location (Place 1 QR → go to Location 1)
- Try manual code entry (UUID printed below QR image)
- Regenerate QRs: delete and recreate the path, reprint QR page

### Teams can't login
- Verify PIN and exact color spelling (e.g., "Red" not "red")
- Color is case-insensitive in backend but use exact name from dropdown
- Check team is registered in host's Teams section

---

## File Structure

```
shodhinchu-saadinchu/
├── backend/
│   ├── models/
│   │   ├── Path.js          # Path + Place schema with validation codes
│   │   └── Team.js          # Team schema with progress tracking
│   ├── routes/
│   │   ├── auth.js          # Host/team login
│   │   ├── paths.js         # CRUD + QR generation
│   │   ├── teams.js         # Team registration
│   │   ├── game.js          # QR validation + clue progression
│   │   └── host.js          # Dashboard + leaderboard
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── server.js            # Express + Socket.io server
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Login state
│   │   │   └── LanguageContext.js # Telugu/English
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── HostLogin.js
│   │   │   ├── TeamLogin.js
│   │   │   ├── HostDashboard.js  # Real-time dashboard
│   │   │   ├── PathManager.js    # Create/edit paths
│   │   │   ├── TeamManager.js    # Register teams
│   │   │   ├── QRPrintPage.js    # Print QR codes
│   │   │   └── TeamGame.js       # Team game interface
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── QRScanner.js      # Camera QR reader
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── .env.example
│   └── package.json
│
├── package.json
└── README.md
```

---

## Support

For issues, check:
1. Backend console logs (Terminal 1)
2. Browser console (F12 → Console)
3. Network tab in browser DevTools

The QR validation code is the heart of the game. Each QR encodes a unique UUID.
The backend validates this UUID against the team's current expected place.
