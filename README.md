# ECNL Scout Outreach Platform

AI-powered platform to help ECNL soccer players connect with college coaches.

## 📋 Current Status

✅ Scout data scraped (76 colleges, 99 coaches)
✅ MVLA B10 schedule extracted (3 games)
✅ Architecture documented
⏳ Building MVP...

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Add your API keys to .env
# Edit .env and add OPENAI_API_KEY and SENDGRID_API_KEY

# 3. Start all services
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: localhost:5432
```

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+
- PostgreSQL 15+

**Backend:**
```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your database URL and API keys
npm run migrate
npm run dev
# Runs on http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## 📁 Project Structure

```
ecnl_outreach/
├── backend/           # Express API
├── frontend/          # React app
├── scraper/          # Web scrapers (completed)
├── data/             # Scraped data
├── docs/             # Documentation
├── docker-compose.yml
└── README.md
```

## 🧪 Testing Each Component

After each step, test the component:

### Test Backend
```bash
# Health check
curl http://localhost:3001/health

# Get colleges
curl http://localhost:3001/api/colleges
```

### Test Frontend
```bash
# Open in browser
open http://localhost:3000
```

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - Full technical design
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Development plan
- [Outreach Plan](./OUTREACH_PLAN.md) - Scout data & strategy

## 🛠️ Development Commands

```bash
# Start everything (Docker)
docker-compose up

# Stop everything
docker-compose down

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Run database migrations
docker-compose exec backend npm run migrate

# Seed database with scraped data
docker-compose exec backend npm run seed
```

## 🔧 Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000 or 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Database connection issues:**
```bash
# Check PostgreSQL is running
docker-compose ps
# Restart database
docker-compose restart postgres
```

## 📝 Next Steps

Current phase: **Step 1 - Project Setup**

- [x] Project structure created
- [x] Docker configuration
- [ ] Backend API setup
- [ ] Frontend setup
- [ ] Database schema
- [ ] Import scraped data

---

*Last Updated: November 8, 2024*
