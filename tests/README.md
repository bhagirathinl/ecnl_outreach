# Test Scripts - ECNL Outreach Platform

## 📋 How to Use

Run these test scripts **in order** from the project root directory.

### Make Scripts Executable (First Time Only)

```bash
chmod +x tests/*.sh
```

---

## 🧪 Test Sequence

### Test 1: Start Database
```bash
./tests/01-start-database.sh
```
**What it does:** Starts PostgreSQL and Adminer in Docker
**Expected:** Both containers show "Up" status
**Ports:** Database on 5433, Adminer on 8080

---

### Test 2: Install Backend Dependencies
```bash
./tests/02-install-backend.sh
```
**What it does:** Runs `npm install` in backend folder
**Expected:** ~150 packages installed, no errors
**Time:** 30-60 seconds

---

### Test 3: Generate Prisma Client
```bash
./tests/03-generate-prisma.sh
```
**What it does:** Creates Prisma database client
**Expected:** "Generated Prisma Client" message
**Time:** 5-10 seconds

---

### Test 4: Run Database Migrations
```bash
./tests/04-run-migrations.sh
```
**What it does:** Creates all database tables
**You'll be asked:** Type `init` for migration name
**Expected:** 15 tables created
**Time:** 10-15 seconds

---

### Test 5: Start Backend Server
```bash
./tests/05-start-backend.sh
```
**What it does:** Starts Express API server
**Expected:** Server running on http://localhost:3001
**Note:** Keeps running - press Ctrl+C to stop

---

### Test 6: Test API Endpoints
```bash
# Run this in a NEW terminal while server is running
./tests/06-test-api.sh
```
**What it does:** Tests health and API endpoints
**Expected:** JSON responses from both endpoints

---

## 🎁 Bonus: View Database

While everything is running:

**Open browser to:** http://localhost:8080

**Login with:**
- System: PostgreSQL
- Server: postgres
- Username: ecnl_user
- Password: ecnl_pass
- Database: ecnl_outreach

You'll see all 15 tables!

---

## 🔧 Troubleshooting

**If a test fails:**
1. Read the error message carefully
2. Check the "Expected" output in each test
3. Run `docker-compose logs` to see container logs
4. Ask for help with the specific error

**Stop everything:**
```bash
# Stop backend: Press Ctrl+C in the terminal
# Stop Docker: docker-compose down
```

**Start over:**
```bash
docker-compose down
docker-compose up -d
cd backend && npm install
```

---

## ✅ Success Criteria

After all tests pass:
- ✅ PostgreSQL running on port 5433
- ✅ Adminer GUI on port 8080
- ✅ Backend API on port 3001
- ✅ Database has 15 tables
- ✅ API responds to requests

---

**Ready for next phase:** Once all tests pass, we'll move to:
- Import college/scout data
- Build API endpoints
- Create frontend

---

*Last Updated: November 8, 2024*
