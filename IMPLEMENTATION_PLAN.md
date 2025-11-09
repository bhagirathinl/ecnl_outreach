# ECNL Outreach App - Implementation Plan
## MVP Development Roadmap (4 Weeks)

---

## Prerequisites & Setup (You'll need to handle)

### Required Accounts & Services
- [ ] **OpenAI API** - For email generation
  - Sign up at platform.openai.com
  - Generate API key
  - Budget: ~$20-50 for MVP testing

- [ ] **SendGrid** or **AWS SES** - For email sending
  - SendGrid: Free tier (100 emails/day) or $15/mo (40k emails)
  - Configure sender authentication (SPF, DKIM, DMARC)
  - Get API key

- [ ] **Database Hosting** (Choose one):
  - **Option A:** Supabase (easiest - free tier, includes auth)
  - **Option B:** Railway (simple deploy, free tier)
  - **Option C:** AWS RDS (more setup, scalable)

- [ ] **Frontend Hosting**:
  - Vercel (recommended - free tier)
  - Or Netlify

- [ ] **Domain Name** (optional for MVP, but recommended):
  - For email deliverability
  - Custom sender domain increases trust

### Local Development Requirements
- Node.js 18+ installed
- Git installed
- Code editor (VS Code recommended)
- Postgres installed locally (or use Docker)

---

## Tech Stack Decisions

### Frontend
```
- React 18 + TypeScript
- Vite (faster than Create React App)
- Tailwind CSS
- React Router v6
- React Hook Form (form handling)
- Axios (API calls)
- Zustand or Context API (state management)
- React Query (data fetching)
```

### Backend
```
- Node.js + Express + TypeScript
- PostgreSQL 15+
- Prisma ORM (better DX than raw SQL)
- JWT for authentication
- Bull + Redis (for job queue - Phase 2)
- Node-cron (for scheduled tasks)
```

### Email & AI
```
- OpenAI API (GPT-4o-mini for cost efficiency)
- SendGrid Node.js SDK
- Nodemailer (as backup)
```

---

## Week-by-Week Development Plan

### **Week 1: Foundation & Core Setup**

#### Day 1-2: Project Infrastructure
**Tasks:**
- [ ] Initialize monorepo structure (frontend + backend)
- [ ] Set up TypeScript configs
- [ ] Database schema design & Prisma setup
- [ ] Create database migrations
- [ ] Basic Express server with health check
- [ ] React app with Tailwind configured
- [ ] Environment variable setup (.env templates)

**Deliverables:**
- Running backend on localhost:3000
- Running frontend on localhost:5173
- Database connected and migrated
- Git repo initialized with .gitignore

#### Day 3-4: Authentication System
**Tasks:**
- [ ] User registration endpoint
- [ ] Login endpoint with JWT
- [ ] Password hashing (bcrypt)
- [ ] Protected route middleware
- [ ] Login/Register UI components
- [ ] Auth state management
- [ ] Protected routes in React

**Deliverables:**
- Users can register and login
- JWT token stored securely
- Protected dashboard route

#### Day 5-7: Student Profile Creation
**Tasks:**
- [ ] Multi-step profile form UI
  - Step 1: Academic info
  - Step 2: Soccer profile
  - Step 3: Preferences
- [ ] Form validation (React Hook Form + Zod)
- [ ] Profile creation API endpoints
- [ ] Profile update endpoints
- [ ] Profile display page

**Deliverables:**
- Complete profile creation flow
- Profile data saved to database
- Ability to edit profile

---

### **Week 2: College Database & Selection**

#### Day 1-2: College Database Setup
**Tasks:**
- [ ] Design colleges table schema
- [ ] Create coaches table schema
- [ ] Build seed script for 100 D1 schools
- [ ] Manual data collection from public sources:
  - School websites
  - NCAA website
  - Coach contact info
- [ ] Seed database with initial data
- [ ] College API endpoints (GET /colleges, GET /colleges/:id)

**Deliverables:**
- Database seeded with 100 colleges
- 100 verified coach emails
- API to fetch colleges

#### Day 3-4: College Selection Interface
**Tasks:**
- [ ] College browse/search page
- [ ] Filter by division, state, conference
- [ ] College detail view (modal or page)
- [ ] "Add to campaign" functionality
- [ ] Selected colleges list
- [ ] Remove from selection

**Deliverables:**
- Working college browser
- Students can select 10-30 schools
- Selected schools saved to campaign

#### Day 5-7: Campaign Management
**Tasks:**
- [ ] Campaign creation endpoint
- [ ] Campaign-schools relationship (many-to-many)
- [ ] Campaign dashboard UI
- [ ] View selected schools in campaign
- [ ] Campaign status display
- [ ] Campaign settings (start date, etc.)

**Deliverables:**
- Students can create a campaign
- View all selected schools
- Campaign status tracking

---

### **Week 3: AI Email Generation & Sending**

#### Day 1-2: OpenAI Integration
**Tasks:**
- [ ] OpenAI API integration setup
- [ ] Email generation prompt engineering
- [ ] Test prompts with various student profiles
- [ ] Create prompt templates for:
  - Initial outreach
  - Follow-up 1
  - Follow-up 2
- [ ] API endpoint: POST /api/generate-email
- [ ] Preview generated email in UI

**Deliverables:**
- Generate personalized email for any student/school combo
- Preview email before sending
- Quality emails that don't sound generic

**Sample Prompt Structure:**
```
You are writing an authentic recruiting email on behalf of a high school soccer player.

Student Info:
- Name: {name}
- Position: {position}
- Graduation Year: {grad_year}
- GPA: {gpa}
- SAT/ACT: {scores}
- Club: {club_team}
- Stats: {stats}
- Highlight Video: {video_url}
- Major Interest: {major}

Target Coach:
- Name: {coach_name}
- School: {school_name}
- Division: {division}
- Recent Success: {recent_record}
- Conference: {conference}

Write a genuine, personalized email (200-250 words):
1. Authentic student voice (not overly formal)
2. Specific mention of THIS program (recent success, playing style, etc.)
3. Include key stats naturally
4. Express genuine interest
5. Ask about recruiting timeline
6. Include highlight video link
7. Professional but warm tone

Also provide a compelling subject line (under 60 chars).

Return as JSON:
{
  "subject": "...",
  "body": "..."
}
```

#### Day 3-5: Email Sending System
**Tasks:**
- [ ] SendGrid/SES integration
- [ ] Email sending endpoint: POST /api/send-email
- [ ] Message tracking in database
- [ ] Send test emails
- [ ] Email deliverability testing
- [ ] Handle bounces and errors
- [ ] Send button in UI
- [ ] Bulk send (send to all selected schools)
- [ ] Confirm before send modal

**Deliverables:**
- Working email sending
- Emails tracked in database
- Success/error handling
- Students can send initial outreach

#### Day 6-7: Email Review & Editing
**Tasks:**
- [ ] Email preview/edit UI
- [ ] Regenerate email option
- [ ] Manual email editing
- [ ] Save edited emails
- [ ] Track which emails were AI vs manual
- [ ] Email history view per school

**Deliverables:**
- Review all generated emails before sending
- Edit emails if needed
- Regenerate if not satisfied

---

### **Week 4: Tracking, Dashboard & Polish**

#### Day 1-2: Email Tracking & Inbox
**Tasks:**
- [ ] SendGrid webhook setup (opens, clicks)
- [ ] Webhook endpoint to receive events
- [ ] Update message status in database
- [ ] Reply detection (basic)
- [ ] Inbox view for received replies
- [ ] Flag replies for manual review
- [ ] Notification system (basic)

**Deliverables:**
- Track email opens and clicks
- See which coaches opened emails
- View replies in dashboard

#### Day 3-4: Dashboard & Analytics
**Tasks:**
- [ ] Campaign overview dashboard
- [ ] Key metrics:
  - Total emails sent
  - Open rate
  - Reply rate
  - Interested coaches
- [ ] School-by-school status view
- [ ] Timeline of interactions
- [ ] Next steps / action items
- [ ] Visual charts (optional, can use simple stats)

**Deliverables:**
- Comprehensive campaign dashboard
- See all activity at a glance
- Track progress per school

#### Day 5-7: Polish, Testing & Bug Fixes
**Tasks:**
- [ ] Responsive design review
- [ ] Mobile experience improvements
- [ ] Error handling improvements
- [ ] Loading states
- [ ] User testing with 2-3 beta users
- [ ] Bug fixes from testing
- [ ] Performance optimization
- [ ] Security review (SQL injection, XSS, etc.)
- [ ] Documentation:
  - User guide
  - Setup instructions
  - API documentation

**Deliverables:**
- Production-ready MVP
- Tested with real users
- Documentation complete
- Ready for beta launch

---

## Database Schema (Prisma)

```prisma
// schema.prisma

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  firstName     String
  lastName      String
  graduationYear Int
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  profile       StudentProfile?
  campaigns     Campaign[]
}

model StudentProfile {
  id                    String   @id @default(uuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])

  // Academic
  gpaWeighted           Decimal?
  gpaUnweighted         Decimal?
  satScore              Int?
  actScore              Int?
  intendedMajors        Json     // String[]

  // Soccer
  position              String   // enum in app layer
  clubTeam              String?
  ecnlAffiliation       String?
  stats                 Json     // {goals, assists, gamesPlayed}
  highlightVideoUrls    Json     // String[]
  awards                Json     // String[]
  yearsExperience       Int?

  // Preferences
  geographicPreferences Json     // {states: [], regions: [], maxDistance: number}
  divisionPreferences   Json     // String[]
  schoolSizePreference  String?
  schoolTypePreference  String?
  budgetMax             Int?
  timeline              String?
  additionalNotes       String?  @db.Text

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model College {
  id                String   @id @default(uuid())
  name              String
  city              String
  state             String
  division          String
  conference        String?
  schoolSize        String?
  schoolType        String?
  setting           String?
  tuitionInState    Int?
  tuitionOutState   Int?
  acceptanceRate    Decimal?
  avgGpaAdmitted    Decimal?
  avgSatAdmitted    Int?
  programRanking    Int?
  recentRecord      String?
  ncaaAppearances   Int?
  facilitiesQuality String?
  websiteUrl        String?
  athleticsUrl      String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  coaches           Coach[]
  campaignSchools   CampaignSchool[]
}

model Coach {
  id                   String    @id @default(uuid())
  collegeId            String
  college              College   @relation(fields: [collegeId], references: [id])

  firstName            String
  lastName             String
  title                String
  email                String?   @unique
  phone                String?
  secondaryEmail       String?
  recruitingFormUrl    String?
  linkedinUrl          String?
  yearsAtProgram       Int?
  bioUrl               String?
  lastVerifiedAt       DateTime?
  emailValid           Boolean   @default(true)
  responseRate         Decimal?
  avgResponseTimeDays  Int?

  campaignSchools      CampaignSchool[]
}

model Campaign {
  id                  String    @id @default(uuid())
  userId              String
  user                User      @relation(fields: [userId], references: [id])

  status              String    // draft, active, paused, completed
  targetSchoolsCount  Int       @default(0)
  startedAt           DateTime?
  completedAt         DateTime?
  overallResponseRate Decimal?

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  campaignSchools     CampaignSchool[]
}

model CampaignSchool {
  id              String    @id @default(uuid())
  campaignId      String
  campaign        Campaign  @relation(fields: [campaignId], references: [id])
  collegeId       String
  college         College   @relation(fields: [collegeId], references: [id])
  coachId         String?
  coach           Coach?    @relation(fields: [coachId], references: [id])

  fitScore        Decimal?
  fitCategory     String?   // reach, target, safety
  status          String    @default("pending") // pending, contacted, replied, interested, not_interested, no_response

  addedAt         DateTime  @default(now())
  firstContactAt  DateTime?
  lastContactAt   DateTime?

  messages        Message[]
}

model Message {
  id                   String          @id @default(uuid())
  campaignSchoolId     String
  campaignSchool       CampaignSchool  @relation(fields: [campaignSchoolId], references: [id])

  messageType          String          // initial, follow_up_1, follow_up_2, reply, manual
  direction            String          // outbound, inbound
  subject              String?
  body                 String          @db.Text

  sentAt               DateTime?
  openedAt             DateTime?
  clickedAt            DateTime?
  repliedAt            DateTime?

  replyClassification  String?         // interested, not_interested, needs_info, neutral
  needsHumanReview     Boolean         @default(false)
  reviewedAt           DateTime?
  reviewerNotes        String?         @db.Text

  createdAt            DateTime        @default(now())
}
```

---

## API Endpoints Overview

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
```

### Profile
```
POST   /api/profile
GET    /api/profile
PUT    /api/profile
```

### Colleges
```
GET    /api/colleges
GET    /api/colleges/:id
POST   /api/colleges (admin only)
```

### Campaigns
```
POST   /api/campaigns
GET    /api/campaigns
GET    /api/campaigns/:id
PUT    /api/campaigns/:id
DELETE /api/campaigns/:id
POST   /api/campaigns/:id/schools (add school to campaign)
DELETE /api/campaigns/:id/schools/:schoolId
```

### Email
```
POST   /api/emails/generate
POST   /api/emails/send
GET    /api/emails/campaign/:campaignId
POST   /api/webhooks/sendgrid (webhook for email events)
```

### Messages
```
GET    /api/messages/campaign/:campaignId
GET    /api/messages/:id
PUT    /api/messages/:id (for manual review)
```

---

## Environment Variables

### Backend (.env)
```bash
# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecnl_outreach

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-...

# SendGrid
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=ECNL Outreach

# Redis (for job queue - Phase 2)
REDIS_URL=redis://localhost:6379

# Optional
SENTRY_DSN=
LOG_LEVEL=debug
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000/api
```

---

## Testing Strategy

### Week 1-3: Development Testing
- Manual testing as we build
- Postman/Thunder Client for API testing
- Console logs and debugging

### Week 4: User Testing
- **2-3 Beta Users** (ideally ECNL players you know)
- Test scenarios:
  1. Complete signup → profile creation → college selection → send emails
  2. Receive reply and check dashboard
  3. Edit profile and regenerate emails
  4. Mobile experience
- Collect feedback on:
  - Email quality (do they sound authentic?)
  - UI/UX ease of use
  - Missing features
  - Bugs/issues

### Post-MVP: Automated Testing
- Unit tests for critical functions
- Integration tests for API endpoints
- E2E tests with Playwright (Phase 2)

---

## Deployment Plan

### MVP Deployment (End of Week 4)

#### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Configure build settings (Vite)
3. Add environment variables
4. Deploy to production URL

#### Backend (Railway or Render)
1. Connect GitHub repo
2. Configure start script
3. Add environment variables
4. Provision PostgreSQL addon
5. Run migrations
6. Deploy

#### Database
- Use Railway Postgres or Supabase
- Automated backups
- Connection pooling

#### Email Domain Setup
1. Configure DNS records (SPF, DKIM, DMARC)
2. Warm up sending domain (gradual increase)
3. Monitor deliverability

---

## Success Criteria for MVP Launch

### Functionality
- [ ] 5-10 beta users can complete full flow
- [ ] Emails successfully delivered and tracked
- [ ] At least 20% open rate on test emails
- [ ] Zero critical bugs
- [ ] Mobile responsive

### Quality
- [ ] Emails sound authentic (based on user feedback)
- [ ] No generic AI language
- [ ] Professional UI/UX
- [ ] Fast load times (<2s)

### Data
- [ ] 100 colleges in database
- [ ] 100 verified coach emails
- [ ] Email templates tested and refined

### Metrics to Track
- User signup → profile completion rate
- Profile → campaign creation rate
- Emails sent per user
- Email open rate
- Email reply rate
- Time from signup to first email sent

---

## Post-MVP: Phase 2 Roadmap (Optional)

### Automated Follow-ups (2-3 weeks)
- Bull queue for scheduled emails
- Follow-up sequence automation
- Smart scheduling (avoid weekends)

### Reply Classification (1-2 weeks)
- GPT-4 to classify replies
- Auto-flag interested coaches
- Sentiment analysis

### Expanded College Database (2-3 weeks)
- Web scraper for coach emails
- 500+ schools across all divisions
- Regular verification system

### Recommendation Engine (2-3 weeks)
- Implement scoring algorithm
- AI-powered matching
- Auto-suggest schools

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Email deliverability issues | Start with SendGrid, warm up domain, monitor bounce rates |
| OpenAI API costs too high | Use GPT-4o-mini, cache prompts, set usage limits |
| Database performance | Use indexes, connection pooling, optimize queries |
| Security vulnerabilities | Input validation, parameterized queries, security headers |

### Product Risks
| Risk | Mitigation |
|------|------------|
| Emails sound too generic | Extensive prompt engineering, human review, A/B testing |
| Low response rates | Focus on email quality over quantity, test with real users |
| NCAA compliance issues | Research rules, add disclaimers, consult expert |
| User churn after first campaign | Build engagement features, email reminders, success stories |

---

## Budget Estimate (Monthly - MVP)

| Service | Cost |
|---------|------|
| Vercel (Frontend) | Free |
| Railway/Render (Backend) | $5-10 |
| PostgreSQL | $0 (included) |
| SendGrid | $15 (or free 100/day) |
| OpenAI API | $20-50 |
| Domain | $12/year |
| **Total** | **$40-75/month** |

---

## Next Steps

1. **Review this plan** - Any changes or additions?
2. **Set up accounts** - OpenAI, SendGrid, Vercel, Railway
3. **Share API keys** - Securely share credentials
4. **Start coding** - I'll begin Week 1, Day 1 tasks
5. **Daily check-ins** - Quick reviews and adjustments

Ready to proceed? Let me know if you want to modify anything in this plan!
