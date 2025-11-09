# Database Schema Documentation

## 📊 Overview

The ECNL Outreach Platform uses **15 tables** to manage:
- Player profiles
- College and coach information
- Events and schedules
- Outreach campaigns
- Email drafts and tracking
- Coach responses

---

## 🗂️ Table Structure

### **1. PlayerProfile**
Stores student-athlete information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `firstName` | String | Player's first name |
| `lastName` | String | Player's last name |
| `email` | String | Unique email address |
| `position` | String | Soccer position (Midfielder, Forward, etc.) |
| `jerseyNumber` | Int | Jersey number |
| `graduationYear` | Int | High school graduation year |
| `dateOfBirth` | DateTime | Birth date |
| `gpaWeighted` | Float | Weighted GPA |
| `gpaUnweighted` | Float | Unweighted GPA |
| `satScore` | Int | SAT score |
| `actScore` | Int | ACT score |
| `intendedMajor` | String | Intended college major |
| `academicInterests` | String[] | List of academic interests |
| `clubTeam` | String | Club team name (e.g., "MVLA") |
| `currentSeasonStats` | JSON | {goals, assists, gamesPlayed} |
| `careerStats` | JSON | Career statistics |
| `achievements` | String[] | Awards and achievements |
| `highlightVideos` | JSON[] | [{url, title, platform}] |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Has many `Campaign`
- Has many `PlayerGame`

---

### **2. Event**
Stores information about ECNL events and showcases.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | String | Event name (e.g., "ECNL Phoenix") |
| `startDate` | DateTime | Event start date |
| `endDate` | DateTime | Event end date |
| `location` | String | City/state |
| `venue` | String | Venue name (e.g., "Reata Sports Complex") |
| `eventType` | String | Event type (ECNL, Showcase, etc.) |
| `externalEventId` | String | Total Global Sports event ID |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Has many `PlayerGame`
- Has many `EventAttendance`
- Has many `Campaign`

**Example:**
```
name: "ECNL Phoenix"
startDate: 2025-11-21
endDate: 2025-11-23
location: "Phoenix, AZ"
venue: "Reata Sports Complex"
```

---

### **3. PlayerGame**
Stores player's game schedule within an event.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `playerId` | UUID | Foreign key → PlayerProfile |
| `eventId` | UUID | Foreign key → Event |
| `gameDate` | DateTime | Date of game |
| `gameTime` | String | Time of game (e.g., "10:00 AM") |
| `opponent` | String | Opposing team name |
| `field` | String | Field number/name |
| `notes` | String | Additional notes |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Example:**
```
gameDate: 2025-11-21
gameTime: "10:00 AM"
opponent: "Dallas Texans ECNL B10"
field: "Field #19"
```

---

### **4. College**
Stores college/university information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | String | College name |
| `division` | String | NCAA division (Division 1, 2, 3, NAIA, JC) |
| `conference` | String | Athletic conference |
| `city` | String | City |
| `state` | String | State |
| `schoolType` | String | Public or Private |
| `website` | String | School website URL |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Unique Constraint:** `(name, division)`

**Relationships:**
- Has many `Coach`
- Has many `EventAttendance`
- Has many `CampaignTarget`

**Example:**
```
name: "Stanford University"
division: "Division 1"
conference: "Pac-12"
city: "Stanford"
state: "CA"
schoolType: "Private"
```

---

### **5. Coach**
Stores coaching staff information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `collegeId` | UUID | Foreign key → College |
| `fullName` | String | Full name |
| `title` | String | Position (Head Coach, Assistant, etc.) |
| `email` | String | Email address |
| `phone` | String | Phone number |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Belongs to `College`
- Has many `EventAttendance`
- Has many `CampaignTarget`

**Example:**
```
fullName: "John Smith"
title: "Head Coach"
email: "jsmith@stanford.edu"
collegeId: <Stanford's UUID>
```

---

### **6. EventAttendance**
Links scouts (colleges/coaches) to events they're attending.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `eventId` | UUID | Foreign key → Event |
| `collegeId` | UUID | Foreign key → College |
| `coachId` | UUID | Foreign key → Coach (nullable) |
| `createdAt` | DateTime | Record creation timestamp |

**Unique Constraint:** `(eventId, collegeId, coachId)`

**Purpose:** Tracks which scouts are attending which events (imported from scraped data).

**Example:**
```
eventId: <ECNL Phoenix UUID>
collegeId: <Stanford UUID>
coachId: <Coach John Smith UUID>
```

---

### **7. Campaign**
Represents an outreach campaign to multiple schools.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `playerId` | UUID | Foreign key → PlayerProfile |
| `eventId` | UUID | Foreign key → Event (nullable) |
| `name` | String | Campaign name |
| `status` | String | draft, active, paused, completed |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Belongs to `PlayerProfile`
- Optionally linked to `Event`
- Has many `CampaignTarget`

**Example:**
```
name: "ECNL Phoenix 2025 - D1 Outreach"
status: "active"
playerId: <Player UUID>
eventId: <ECNL Phoenix UUID>
```

---

### **8. CampaignTarget**
Represents a selected coach for outreach within a campaign.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `campaignId` | UUID | Foreign key → Campaign |
| `collegeId` | UUID | Foreign key → College |
| `coachId` | UUID | Foreign key → Coach |
| `status` | String | pending, draft_ready, approved, sent, opened, replied |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Unique Constraint:** `(campaignId, coachId)`

**Relationships:**
- Belongs to `Campaign`
- Belongs to `College`
- Belongs to `Coach`
- Has many `EmailDraft`
- Has many `SentEmail`
- Has many `EmailResponse`

**Status Flow:**
```
pending → draft_ready → approved → sent → opened → replied
```

---

### **9. EmailDraft**
Stores AI-generated or manually created email drafts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `targetId` | UUID | Foreign key → CampaignTarget |
| `subject` | String | Email subject line |
| `body` | String | Email body text |
| `aiGenerated` | Boolean | Was this AI-generated? (default: true) |
| `edited` | Boolean | Was it edited by user? (default: false) |
| `approved` | Boolean | Has user approved it? (default: false) |
| `generationPrompt` | String | AI prompt used (for debugging) |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Belongs to `CampaignTarget`
- Has one `SentEmail` (when sent)

**Example:**
```
subject: "2027 Midfielder - MVLA at ECNL Phoenix Nov 21-23"
body: "Coach Smith, My name is..."
aiGenerated: true
approved: true
```

---

### **10. SentEmail**
Tracks emails that have been sent.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `targetId` | UUID | Foreign key → CampaignTarget |
| `draftId` | UUID | Foreign key → EmailDraft (nullable) |
| `subject` | String | Email subject |
| `body` | String | Email body |
| `fromEmail` | String | Sender email |
| `toEmail` | String | Recipient email |
| `sentAt` | DateTime | When email was sent |
| `openedAt` | DateTime | When email was opened (nullable) |
| `clickedAt` | DateTime | When links were clicked (nullable) |
| `repliedAt` | DateTime | When coach replied (nullable) |
| `bounced` | Boolean | Did email bounce? (default: false) |
| `sendgridMessageId` | String | SendGrid tracking ID |
| `emailType` | String | initial, follow_up_1, follow_up_2 |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Belongs to `CampaignTarget`
- Optionally linked to `EmailDraft`
- Has many `EmailResponse`

---

### **11. EmailResponse**
Stores coach replies to sent emails.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `sentEmailId` | UUID | Foreign key → SentEmail |
| `targetId` | UUID | Foreign key → CampaignTarget |
| `fromEmail` | String | Coach's email |
| `subject` | String | Reply subject |
| `body` | String | Reply body |
| `receivedAt` | DateTime | When reply was received |
| `sentiment` | String | AI classification (interested, not_interested, neutral, needs_info) |
| `confidence` | Float | AI confidence score (0-1) |
| `userClassified` | Boolean | Did user override AI? (default: false) |
| `userSentiment` | String | User's classification override |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Belongs to `SentEmail`
- Belongs to `CampaignTarget`

---

## 🔗 Relationship Diagram

```
PlayerProfile
    ├── Campaign (1 → many)
    │      └── CampaignTarget (1 → many)
    │             ├── EmailDraft (1 → many)
    │             ├── SentEmail (1 → many)
    │             │      └── EmailResponse (1 → many)
    │             ├── College (many → 1)
    │             └── Coach (many → 1)
    └── PlayerGame (1 → many)
           └── Event (many → 1)

Event
    ├── EventAttendance (1 → many)
    │      ├── College (many → 1)
    │      └── Coach (many → 1)
    ├── PlayerGame (1 → many)
    └── Campaign (1 → many)

College
    ├── Coach (1 → many)
    ├── EventAttendance (1 → many)
    └── CampaignTarget (1 → many)

Coach
    ├── EventAttendance (1 → many)
    └── CampaignTarget (1 → many)
```

---

## 📈 User Journey Through Database

### **1. Player Creates Profile**
```
INSERT INTO PlayerProfile (firstName, lastName, email, ...)
```

### **2. Event Data Imported**
```
INSERT INTO Event (name, startDate, ...)
INSERT INTO College (name, division, ...)
INSERT INTO Coach (collegeId, fullName, ...)
INSERT INTO EventAttendance (eventId, collegeId, coachId)
```

### **3. Player Creates Campaign**
```
INSERT INTO Campaign (playerId, eventId, name, status='draft')
```

### **4. Player Selects Scouts**
```
INSERT INTO CampaignTarget (campaignId, coachId, status='pending')
-- Repeat for each selected coach
```

### **5. AI Generates Emails**
```
INSERT INTO EmailDraft (targetId, subject, body, aiGenerated=true)
-- One draft per CampaignTarget
```

### **6. Player Reviews & Approves**
```
UPDATE EmailDraft SET approved=true WHERE id=...
UPDATE CampaignTarget SET status='approved' WHERE id=...
```

### **7. Emails Sent**
```
INSERT INTO SentEmail (targetId, draftId, fromEmail, toEmail, sentAt)
UPDATE CampaignTarget SET status='sent' WHERE id=...
```

### **8. Tracking Events**
```
UPDATE SentEmail SET openedAt=NOW() WHERE id=...
UPDATE CampaignTarget SET status='opened' WHERE id=...
```

### **9. Coach Replies**
```
INSERT INTO EmailResponse (sentEmailId, targetId, fromEmail, body, ...)
UPDATE SentEmail SET repliedAt=NOW() WHERE id=...
UPDATE CampaignTarget SET status='replied' WHERE id=...
```

---

## 🔍 Key Queries

### Get all colleges attending an event
```sql
SELECT c.*
FROM College c
JOIN EventAttendance ea ON ea.collegeId = c.id
WHERE ea.eventId = 'event-uuid';
```

### Get campaign status summary
```sql
SELECT
  status,
  COUNT(*) as count
FROM CampaignTarget
WHERE campaignId = 'campaign-uuid'
GROUP BY status;
```

### Get coaches who replied
```sql
SELECT c.fullName, co.name, er.sentiment
FROM EmailResponse er
JOIN CampaignTarget ct ON ct.id = er.targetId
JOIN Coach c ON c.id = ct.coachId
JOIN College co ON co.id = ct.collegeId
WHERE ct.campaignId = 'campaign-uuid'
  AND er.sentiment = 'interested';
```

---

## 📝 Notes

**Data Import:**
- Colleges, Coaches, Events scraped from Total Global Sports
- Imported via seed script

**Email Tracking:**
- Uses SendGrid webhooks to update `openedAt`, `clickedAt`
- Inbound Parse webhook creates `EmailResponse` records

**AI Integration:**
- EmailDraft generation uses OpenAI/Claude
- EmailResponse sentiment analysis uses AI

---

*Last Updated: November 8, 2024*
