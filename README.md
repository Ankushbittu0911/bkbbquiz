# 🏆 BKBBQUIZ - Quiz Contest Platform

A production-ready, mobile-first quiz contest platform where users play quiz contests and win real cash prizes.

## 📁 Project Structure

```
bkbbquiz/
├── client/         # React + Vite + Tailwind (Mobile App)
├── admin/          # React + Vite + Tailwind (Admin Dashboard)
└── server/         # Node.js + Express + MongoDB (API)
```

---

## 🚀 Quick Start

### 1. Server Setup

```bash
cd server
cp .env.example .env   # Fill in your credentials
npm install
npm run seed           # Seed admin + questions + sample contests
npm run dev            # Starts on http://localhost:5000
```

**Required `.env` values:**
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string (e.g. from MongoDB Atlas) |
| `JWT_SECRET` | Any long random string |
| `EMAIL_USER` | Gmail address for password reset emails |
| `EMAIL_PASS` | Gmail App Password (not regular password) |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |

**Default Admin credentials (after seeding):**
- Mobile: `9999999999`
- Password: `admin@123`

### 2. Client Setup

```bash
cd client
cp .env.example .env
# Edit VITE_API_URL if different from http://localhost:5000/api
npm install
npm run dev            # Starts on http://localhost:5173
```

### 3. Admin Setup

```bash
cd admin
cp .env.example .env
# Edit VITE_API_URL if different from http://localhost:5000/api
npm install
npm run dev            # Starts on http://localhost:5174
```

---

## 🌐 Deployment

### Backend → Railway

1. Push `server/` to GitHub
2. Create Railway project → Connect GitHub repo
3. Set root directory to `server/`
4. Add all environment variables from `.env`
5. Set start command: `npm start`

### Frontend → Vercel

1. Push `client/` to GitHub
2. Create Vercel project → Connect GitHub repo
3. Set root directory to `client/`
4. Add environment variable: `VITE_API_URL=https://your-railway-url.up.railway.app/api`
5. Deploy

### Admin → Vercel

1. Same as frontend but point to the `admin/` directory
2. Add `VITE_API_URL` pointing to the same Railway backend

---

## 📱 Client App Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Mobile number + password login |
| Register | `/register` | 2-step registration form |
| Home | `/` | Contest listing with category filters |
| Contest Detail | `/contest/:id` | Prize breakdown, join CTA |
| Quiz | `/quiz/:contestId` | 10 questions, 5-minute timer |
| Quiz Result | `/quiz/:contestId/result` | Score + ticket info |
| Tickets | `/tickets` | All user tickets |
| Results | `/results` | Completed contest outcomes |
| Wallet | `/wallet` | Balance + transactions |
| Deposit | `/deposit` | UPI QR + screenshot proof |
| Withdraw | `/withdraw` | Winnings withdrawal |
| Notifications | `/notifications` | Platform + system alerts |
| Profile | `/profile` | Edit profile |
| Menu | `/menu` | App settings, logout |

## 🖥️ Admin Panel Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | Stats, charts, recent users |
| Contests | `/contests` | Create, edit, activate, close |
| Questions | `/questions` | Add/edit quiz questions by category |
| Winners | `/winners` | Random draw for closed contests |
| Users | `/users` | Ban/unban, wallet adjustment |
| Deposits | `/deposits` | Approve/reject with screenshot |
| Withdrawals | `/withdrawals` | Approve/reject with UTR |
| Notifications | `/notifications` | Broadcast to all or specific user |
| Settings | `/settings` | UPI ID, platform fee, limits |

---

## 🎮 How It Works

1. **User registers** with mobile, email, DOB, username
2. **User deposits** money via UPI → Admin approves → Wallet credited
3. **User joins contest** → Entry fee deducted → Gets a ticket number
4. **User completes quiz** → 10 questions, 5 minutes → Score recorded
5. **Admin closes contest** → Clicks "Draw Winners" → Random tickets selected (NOT score-based)
6. **Winners get prizes** credited to winnings wallet
7. **User withdraws** winnings via UPI → Admin processes manually

---

## 🔐 Security Features

- JWT authentication (accessToken)
- Rate limiting on auth routes (5 req/15min)
- Password hashing with bcrypt (10 rounds)
- Admin-only middleware on all `/admin/*` routes
- File upload validation (image types only)
- Input sanitization via Express

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 8, Tailwind CSS v4 |
| State | TanStack Query v5, Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT |
| Email | Nodemailer (Gmail SMTP) |
| File Upload | Cloudinary + Multer |
| Charts | Recharts |
| Icons | Lucide React |
| Date Utils | date-fns |
| QR Code | qrcode.react |

---

## 📦 Key API Endpoints

```
POST /api/auth/register
POST /api/auth/login
GET  /api/contests
POST /api/contests/:id/join
POST /api/contests/:id/submit
GET  /api/wallet
POST /api/deposits
POST /api/withdrawals
GET  /api/notifications
GET  /api/admin/dashboard
POST /api/admin/contests
PUT  /api/admin/deposits/:id/approve
POST /api/admin/winners/:contestId/generate
PUT  /api/admin/settings
```

---

## 📝 Notes

- **Deposit balance** is for joining contests only
- **Winnings balance** is only for withdrawals
- **Winner selection** is purely random (lottery model) — score is NOT used
- **Quiz timer**: 5 minutes for 10 questions (configurable per contest)
- **Platform fee**: Configurable (default 30% of prize pool)
