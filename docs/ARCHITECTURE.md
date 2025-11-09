# ECNL Scout Outreach App - Architecture & Implementation Plan

## 📋 Table of Contents
1. [Overview](#overview)
2. [User Flow](#user-flow)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [Application Architecture](#application-architecture)
6. [Implementation Phases](#implementation-phases)
7. [API Endpoints](#api-endpoints)
8. [Email System](#email-system)
9. [Security & Privacy](#security--privacy)

---

## Overview

### Purpose
An AI-powered web application that helps ECNL soccer players connect with college coaches through automated, personalized outreach campaigns.

### Core Features
1. **Player Profile Management** - Store player stats, videos, academic info
2. **Scout Database** - Browse and select colleges/coaches to target
3. **AI Email Generation** - Auto-draft personalized emails using AI
4. **Email Review & Edit** - Human-in-the-loop email approval
5. **Email Sending & Tracking** - Send emails with open/click tracking
6. **Response Monitoring** - Poll inbox for coach replies
7. **Auto Follow-ups** - Smart follow-up email automation
8. **Dashboard & Analytics** - Track campaign performance

---

## User Flow

### Phase 1: Setup
```
1. Player creates account
2. Player fills out profile:
   - Personal info (name, position, jersey #)
   - Academic info (GPA, test scores, intended major)
   - Athletic stats (goals, assists, achievements)
   - Upload/link highlight videos
   - Upcoming events (ECNL Phoenix, etc.)
3. System saves player profile
```

### Phase 2: Scout Selection
```
1. Player views list of scouts attending their event
2. Filters by:
   - Division (D1, D2, D3, NAIA, JC)
   - Location/State
   - Conference
   - Academic fit
3. Player selects target colleges (checkbox selection)
4. Reviews selection summary
5. Confirms target list
```

### Phase 3: Email Generation
```
1. System generates AI-powered emails for each selected coach
2. Personalization includes:
   - Player-specific info (stats, position, video)
   - School-specific details (recent success, program style)
   - Event-specific info (game times, fields)
3. AI creates subject line + body for each coach
4. All draft emails shown in review interface
```

### Phase 4: Review & Edit
```
1. Player reviews each generated email
2. Can edit any part (subject, body)
3. Can regenerate individual emails
4. Can preview how email will look
5. Approves final emails for sending
```

### Phase 5: Sending & Tracking
```
1. System sends approved emails
2. Tracks delivery status
3. Monitors opens and clicks
4. Logs all sent emails to database
```

### Phase 6: Response Management
```
1. System polls player's inbox for replies
2. Detects coach responses
3. Notifies player of new replies
4. Categorizes responses:
   - Interested (wants to talk)
   - Not interested
   - Needs more info
   - Auto-reply
5. Player can manually mark status
```

### Phase 7: Follow-ups
```
1. If no response after 7 days → suggest follow-up
2. Player approves follow-up email
3. System sends follow-up
4. After 2nd email with no response → pause outreach
5. Player can manually send additional follow-ups
```

---

## Tech Stack

### Frontend
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query + Zustand
- **Forms:** React Hook Form + Zod validation
- **Routing:** React Router v6
- **UI Components:** shadcn/ui or Headless UI
- **Email Editor:** TipTap or Draft.js

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **File Storage:** AWS S3 or Cloudflare R2

### Email Services
- **Sending:** SendGrid or AWS SES
- **Parsing:** SendGrid Inbound Parse Webhook
- **Tracking:** SendGrid Event Webhook

### AI Services
- **Email Generation:** OpenAI GPT-4 or Anthropic Claude
- **API:** Direct API calls with streaming

### Job Queue & Background Tasks
- **Queue:** Bull (Redis-based)
- **Scheduler:** node-cron
- **Tasks:**
  - Email polling
  - Follow-up scheduling
  - Analytics generation

### Deployment
- **Frontend:** Vercel or Netlify
- **Backend:** Railway, Render, or AWS
- **Database:** Railway, Neon, or Supabase
- **Redis:** Upstash or Railway

---

## Database Schema

### Users (Players)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Player Profiles
```sql
CREATE TABLE player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Personal Info
  position VARCHAR(50), -- 'Midfielder', 'Forward', etc.
  jersey_number INTEGER,
  graduation_year INTEGER,
  date_of_birth DATE,

  -- Academic Info
  gpa_weighted DECIMAL(3,2),
  gpa_unweighted DECIMAL(3,2),
  sat_score INTEGER,
  act_score INTEGER,
  intended_major VARCHAR(255),
  academic_interests TEXT[],

  -- Athletic Info
  club_team VARCHAR(255),
  current_season_stats JSONB, -- {goals, assists, games_played}
  career_stats JSONB,
  achievements TEXT[],

  -- Media
  highlight_videos JSONB[], -- [{url, title, platform}]

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location VARCHAR(255),
  venue VARCHAR(255),
  event_type VARCHAR(50), -- 'ECNL', 'Showcase', etc.
  external_event_id VARCHAR(255), -- TGS event ID

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Player Games (Schedule)
```sql
CREATE TABLE player_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,

  game_date DATE NOT NULL,
  game_time TIME NOT NULL,
  opponent VARCHAR(255),
  field VARCHAR(100),
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Colleges
```sql
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  division VARCHAR(50), -- 'Division 1', 'Division 2', etc.
  conference VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  school_type VARCHAR(50), -- 'Public', 'Private'
  website VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(name, division)
);
```

### Coaches
```sql
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,

  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(255) NOT NULL,
  title VARCHAR(100), -- 'Head Coach', 'Assistant Coach'
  email VARCHAR(255),
  phone VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Event Attendance (Scouts at Events)
```sql
CREATE TABLE event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(event_id, college_id, coach_id)
);
```

### Campaigns
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,

  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Campaign Targets (Selected Scouts)
```sql
CREATE TABLE campaign_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,

  status VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'draft_ready', 'approved', 'sent', 'opened',
  -- 'clicked', 'replied', 'interested', 'not_interested'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(campaign_id, coach_id)
);
```

### Email Drafts
```sql
CREATE TABLE email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_target_id UUID REFERENCES campaign_targets(id) ON DELETE CASCADE,

  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,

  ai_generated BOOLEAN DEFAULT true,
  edited BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,

  generation_prompt TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sent Emails
```sql
CREATE TABLE sent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_target_id UUID REFERENCES campaign_targets(id) ON DELETE CASCADE,
  email_draft_id UUID REFERENCES email_drafts(id) ON DELETE SET NULL,

  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  to_email VARCHAR(255) NOT NULL,

  -- Tracking
  sent_at TIMESTAMP DEFAULT NOW(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  replied_at TIMESTAMP,
  bounced BOOLEAN DEFAULT false,

  -- External IDs
  sendgrid_message_id VARCHAR(255),

  email_type VARCHAR(50) DEFAULT 'initial', -- 'initial', 'follow_up_1', 'follow_up_2'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Email Responses
```sql
CREATE TABLE email_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_email_id UUID REFERENCES sent_emails(id) ON DELETE CASCADE,
  campaign_target_id UUID REFERENCES campaign_targets(id) ON DELETE CASCADE,

  from_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  body TEXT NOT NULL,
  received_at TIMESTAMP NOT NULL,

  -- AI Classification
  sentiment VARCHAR(50), -- 'interested', 'not_interested', 'neutral', 'needs_info'
  confidence DECIMAL(3,2),

  -- Manual override
  user_classified BOOLEAN DEFAULT false,
  user_sentiment VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Application Architecture

### Directory Structure
```
ecnl_outreach/
├── frontend/               # React app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities
│   │   ├── api/           # API client
│   │   └── types/         # TypeScript types
│   ├── public/
│   └── package.json
│
├── backend/               # Express API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models (Prisma)
│   │   ├── middleware/    # Express middleware
│   │   ├── jobs/          # Background jobs
│   │   ├── utils/         # Utilities
│   │   └── types/         # TypeScript types
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
├── scraper/               # Web scrapers (existing)
├── data/                  # Scraped data (existing)
└── docs/                  # Documentation
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Set up project infrastructure

**Tasks:**
1. Initialize monorepo structure
2. Set up PostgreSQL database
3. Create Prisma schema
4. Run migrations
5. Set up Express backend with TypeScript
6. Set up React frontend with TypeScript
7. Implement basic authentication (register, login)
8. Create basic routing

**Deliverables:**
- ✅ Running backend API
- ✅ Running frontend app
- ✅ Database with schema
- ✅ User authentication working

---

### Phase 2: Player Profile (Week 2)
**Goal:** Players can create and manage profiles

**Tasks:**
1. Create player profile form
2. Build profile API endpoints
3. Implement file upload for videos
4. Create profile display page
5. Add edit functionality

**Deliverables:**
- ✅ Player can create profile
- ✅ Player can upload videos
- ✅ Player can view/edit profile

---

### Phase 3: Scout Database (Week 3)
**Goal:** Import scraped data and create selection interface

**Tasks:**
1. Create data import script (colleges, coaches from scraped JSON)
2. Build scout browsing interface
3. Implement filtering (division, location, etc.)
4. Create selection mechanism (checkboxes)
5. Build campaign creation flow

**Deliverables:**
- ✅ 76 colleges imported
- ✅ Browsable scout database
- ✅ Player can select target schools
- ✅ Campaign created with selections

---

### Phase 4: AI Email Generation (Week 4)
**Goal:** Generate personalized emails with AI

**Tasks:**
1. Set up OpenAI or Claude API integration
2. Create email generation prompts
3. Build email generation service
4. Generate emails for all selected coaches
5. Store drafts in database

**Deliverables:**
- ✅ AI generates personalized emails
- ✅ Each email includes player info + school specifics
- ✅ Drafts saved to database

---

### Phase 5: Email Review & Editing (Week 5)
**Goal:** Players can review and edit AI-generated emails

**Tasks:**
1. Build email review interface
2. Implement rich text editor
3. Add regenerate functionality
4. Create approval workflow
5. Build preview mode

**Deliverables:**
- ✅ Player can view all drafts
- ✅ Player can edit emails
- ✅ Player can approve emails
- ✅ Approved emails ready to send

---

### Phase 6: Email Sending (Week 6)
**Goal:** Send emails with tracking

**Tasks:**
1. Set up SendGrid account
2. Configure email sending
3. Implement open/click tracking
4. Build sending workflow
5. Create email log display

**Deliverables:**
- ✅ Emails sent successfully
- ✅ Open/click tracking working
- ✅ Player can see sent emails
- ✅ Delivery status visible

---

### Phase 7: Response Monitoring (Week 7)
**Goal:** Detect and display coach replies

**Tasks:**
1. Set up SendGrid Inbound Parse
2. Create webhook endpoint
3. Implement response detection
4. Build notifications system
5. Create response viewing interface

**Deliverables:**
- ✅ System detects replies
- ✅ Player notified of responses
- ✅ Responses displayed in dashboard
- ✅ Can read full email threads

---

### Phase 8: Follow-up Automation (Week 8)
**Goal:** Automated follow-up emails

**Tasks:**
1. Create follow-up scheduling logic
2. Build follow-up email generator
3. Implement approval flow
4. Create background job for scheduling
5. Add manual follow-up option

**Deliverables:**
- ✅ Auto-suggest follow-ups after 7 days
- ✅ Player approves follow-ups
- ✅ System sends follow-ups
- ✅ Smart pause after 2 attempts

---

### Phase 9: Dashboard & Analytics (Week 9)
**Goal:** Performance tracking and insights

**Tasks:**
1. Build campaign dashboard
2. Create analytics visualizations
3. Implement response rate tracking
4. Add status summaries
5. Build action items list

**Deliverables:**
- ✅ Campaign overview dashboard
- ✅ Response rate metrics
- ✅ Status breakdown charts
- ✅ Next actions list

---

## API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Player Profile
```
GET    /api/profile
POST   /api/profile
PUT    /api/profile
POST   /api/profile/videos
DELETE /api/profile/videos/:id
```

### Events & Games
```
GET    /api/events
GET    /api/events/:id
POST   /api/events
GET    /api/games
POST   /api/games
PUT    /api/games/:id
DELETE /api/games/:id
```

### Colleges & Coaches
```
GET    /api/colleges
GET    /api/colleges/:id
GET    /api/colleges/:id/coaches
GET    /api/coaches
GET    /api/coaches/:id
GET    /api/events/:eventId/scouts
```

### Campaigns
```
GET    /api/campaigns
GET    /api/campaigns/:id
POST   /api/campaigns
PUT    /api/campaigns/:id
DELETE /api/campaigns/:id
POST   /api/campaigns/:id/targets (add scout selections)
DELETE /api/campaigns/:id/targets/:targetId
```

### Email Generation
```
POST   /api/campaigns/:id/generate-emails (generate all drafts)
POST   /api/drafts/:id/regenerate (regenerate single email)
PUT    /api/drafts/:id (edit draft)
POST   /api/drafts/:id/approve (approve draft)
```

### Email Sending
```
POST   /api/campaigns/:id/send (send all approved emails)
POST   /api/emails/:id/send (send single email)
GET    /api/emails (get sent emails)
GET    /api/emails/:id
```

### Responses
```
GET    /api/responses
GET    /api/responses/:id
PUT    /api/responses/:id/classify (manual classification)
POST   /api/webhooks/sendgrid/inbound (webhook for incoming emails)
POST   /api/webhooks/sendgrid/events (webhook for tracking events)
```

### Follow-ups
```
GET    /api/campaigns/:id/follow-ups (get suggested follow-ups)
POST   /api/follow-ups/:id/approve (approve follow-up)
POST   /api/follow-ups/:id/send
```

---

## Email System

### SendGrid Configuration

**API Keys:**
- Main API key for sending
- Webhook signing key for security

**Domain Authentication:**
- SPF, DKIM, DMARC setup
- Custom domain (e.g., outreach.ecnlconnect.com)

**Tracking:**
- Open tracking enabled
- Click tracking enabled
- Event webhook configured

**Inbound Parse:**
- MX records configured
- Webhook URL: `https://api.yourapp.com/webhooks/sendgrid/inbound`

### Email Templates

**Initial Email Structure:**
```
Subject: [Player Name] - [Position] | ECNL [Event] [Dates]

Body:
- Greeting (Coach [Last Name])
- Introduction (name, position, grad year, team)
- Why this school (personalized)
- Player profile (stats, academics)
- Event details (game times, fields)
- Call to action (would love to connect)
- Signature (contact info, video link)
```

**Follow-up Structure:**
```
Subject: Re: [Original Subject]

Body:
- Quick check-in
- Reiterate interest
- New update (recent game, achievement)
- Gentle ask about recruiting timeline
```

---

## Security & Privacy

### Authentication
- JWT tokens with 7-day expiration
- Refresh token rotation
- Password hashing with bcrypt (10 rounds)
- Email verification required

### Data Protection
- All passwords hashed
- Email credentials encrypted at rest
- HTTPS only in production
- CORS properly configured

### Email Privacy
- Player emails stored securely
- OAuth2 for email access (Gmail, Outlook)
- No passwords stored in plain text
- Unsubscribe option in all emails

### Rate Limiting
- API rate limits (100 req/min per user)
- Email sending limits (follow SendGrid quotas)
- Prevent spam/abuse

---

## Next Steps

1. **Review & Approve This Plan**
   - Does this match your vision?
   - Any changes needed?

2. **Choose Immediate Path**
   - Option A: Build full app (8-9 weeks)
   - Option B: Build MVP for your son's event (2-3 weeks)

3. **For MVP (Quick Launch for Nov Event):**
   - Skip auth (single user)
   - Manual profile entry
   - Use existing scraped data
   - Simple email generation
   - Manual sending
   - Basic tracking

4. **For Full App:**
   - Follow 9-week plan
   - Multi-user support
   - Complete automation
   - Full dashboard

**What would you prefer? MVP for the November event, or full app?**

---

*Last Updated: November 8, 2024*
