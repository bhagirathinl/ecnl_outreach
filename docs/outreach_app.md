# ECNL College Outreach App - Architecture & Implementation Plan

## Overview
An AI-powered application to help ECNL soccer players connect with college coaches through automated, personalized outreach campaigns.

---

## App Flow

### Phase 1: Student Profile & College Matching

#### 1. Student Input Form
Collect comprehensive student information:

**Academic Information:**
- GPA (weighted/unweighted)
- SAT/ACT scores
- Intended major(s)
- Academic interests/strengths

**Soccer Profile:**
- Position(s)
- Club team/ECNL affiliation
- Stats (goals, assists, games played)
- Highlight video links
- Awards/achievements
- Years of experience
- Current coach references

**Preferences:**
- Geographic preferences (regions, states, distance from home)
- Division level interest (D1, D2, D3, NAIA, or combination)
- School size (small <5k, medium 5k-15k, large >15k)
- School type (public, private, religious affiliation)
- Campus setting (urban, suburban, rural)
- Budget/financial aid needs

**Additional Context:**
- Timeline (graduation year, when they want to commit)
- Special circumstances or requirements
- Any specific schools already on their radar

#### 2. AI-Powered College Recommendation Engine

**Matching Algorithm:**
- Analyze student profile against database of 1,500+ women's soccer programs
- Score each program based on:
  - **Academic Fit** (40%): GPA/test scores vs school's admission range
  - **Athletic Competitiveness** (30%): Student's level vs program's division/ranking
  - **Geographic Preference** (15%): Location alignment with student preferences
  - **Financial Feasibility** (10%): Tuition vs budget, scholarship availability
  - **Program Quality** (5%): Recent record, facilities, coaching stability

**Output:**
- Personalized list of 20-50 recommended colleges
- Ranked by overall fit score
- Categorized as: Reach, Target, Safety schools

#### 3. Student Review & Selection Interface

**Display for Each Recommended School:**
- School name, location, division
- Head coach name and contact info
- Program stats (conference, recent record, NCAA appearances)
- Academic profile (acceptance rate, avg GPA/SAT)
- Estimated costs and scholarship availability
- Fit score breakdown

**Student Actions:**
- Review recommendations
- Add/remove schools manually
- Finalize target list (typically 10-30 schools)
- Confirm profile accuracy
- Approve outreach campaign start

---

### Phase 2: Automated Coach Outreach

#### 1. Coach Contact Discovery (ITZEL System)
- Web scraper finds coach emails from athletic department pages
- Validates email addresses
- Stores primary and secondary contacts
- Notes best contact methods (email, recruiting forms, etc.)

#### 2. AI Email Generation
**Personalization Factors:**
- Student's name, position, stats, achievements
- School-specific details (program style, recent success, conference)
- Academic major fit with school offerings
- Genuine connection points (geography, playing style, etc.)

**Email Sequence:**
1. **Initial Outreach** (Day 0)
   - Introduction and genuine interest
   - Key stats and video link
   - Academic profile
   - Specific reasons for interest in program

2. **First Follow-up** (Day 7-10)
   - Check-in on initial message
   - Add new accomplishment or upcoming tournament info
   - Reinforce interest

3. **Second Follow-up** (Day 14-18)
   - Share recent game performance or new highlight
   - Ask about recruiting timeline
   - Offer to schedule call/visit

#### 3. Campaign Execution
- Automated sending through email service (SendGrid, AWS SES)
- Intelligent scheduling (avoid weekends, late nights)
- Deliverability monitoring (bounce rates, spam flags)
- Engagement tracking (opens, clicks, replies)

#### 4. Reply Detection & Human Handoff
**Automated Monitoring:**
- Parse incoming emails for replies
- Classify response type (interested, not interested, needs more info, neutral)
- Flag for human review

**Human Intervention Points:**
- Coach requests call/meeting
- Coach asks specific questions
- Coach expresses strong interest
- Negative response requiring sensitive handling
- After 3rd message with no response (manual decision needed)

#### 5. Dashboard & Tracking
**For Students:**
- Campaign status overview
- Response rates per school
- Next steps and action items
- Timeline of interactions

**For Reps/Admins:**
- Monitor multiple student campaigns
- Queue of replies needing response
- Performance metrics (response rates by school, division, timing)
- Conversation history

---

## Technical Implementation

### Tech Stack

**Frontend:**
- React + TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

**Backend:**
- Node.js + Express
- PostgreSQL database
- Redis for job queues
- JWT authentication

**AI/ML Services:**
- OpenAI API (GPT-4) for email generation and recommendations
- Claude API (optional) for more nuanced personalization

**Email Infrastructure:**
- SendGrid or AWS SES for sending
- Email parsing service (Mailgun, SendGrid Inbound Parse)
- DKIM/SPF/DMARC configuration for deliverability

**Web Scraping:**
- Puppeteer or Playwright for dynamic pages
- BeautifulSoup/Scrapy for static content
- Proxy rotation to avoid blocking
- Rate limiting and respectful crawling

**Job Queue:**
- Bull (Redis-based) for scheduled follow-ups
- Cron jobs for daily campaign processing

**Hosting:**
- Frontend: Vercel or Netlify
- Backend: AWS EC2/ECS or Railway
- Database: AWS RDS or Supabase
- Storage: AWS S3 for videos/documents

---

## Database Schema

### Core Tables

#### **students**
```sql
id (UUID, primary key)
email (unique)
password_hash
first_name
last_name
graduation_year
created_at
updated_at
```

#### **student_profiles**
```sql
id (UUID, primary key)
student_id (foreign key)
gpa_weighted
gpa_unweighted
sat_score
act_score
intended_majors (JSON array)
position (enum: forward, midfielder, defender, goalkeeper)
club_team
ecnl_affiliation
stats (JSON: {goals, assists, games_played})
highlight_video_urls (JSON array)
awards (JSON array)
years_experience
geographic_preferences (JSON)
division_preferences (JSON array)
school_size_preference (enum)
school_type_preference (enum)
budget_max
timeline
additional_notes (text)
```

#### **colleges**
```sql
id (UUID, primary key)
name
city
state
division (enum: D1, D2, D3, NAIA, NJCAA)
conference
school_size
school_type (public/private)
setting (urban/suburban/rural)
tuition_in_state
tuition_out_state
acceptance_rate
avg_gpa_admitted
avg_sat_admitted
program_ranking (int)
recent_record
ncaa_appearances (int)
facilities_quality (enum: excellent, good, average, basic)
website_url
athletics_url
created_at
updated_at
```

#### **coaches**
```sql
id (UUID, primary key)
college_id (foreign key)
first_name
last_name
title (head coach, assistant, recruiting coordinator)
email (unique)
phone
secondary_email
recruiting_form_url
linkedin_url
years_at_program
bio_url
last_verified_at
email_valid (boolean)
response_rate (decimal)
avg_response_time_days (int)
```

#### **campaigns**
```sql
id (UUID, primary key)
student_id (foreign key)
status (enum: draft, active, paused, completed)
target_schools_count
started_at
completed_at
overall_response_rate (decimal)
created_at
updated_at
```

#### **campaign_schools**
```sql
id (UUID, primary key)
campaign_id (foreign key)
college_id (foreign key)
coach_id (foreign key)
fit_score (decimal)
fit_category (enum: reach, target, safety)
status (enum: pending, contacted, replied, interested, not_interested, no_response)
added_at
first_contact_at
last_contact_at
```

#### **messages**
```sql
id (UUID, primary key)
campaign_school_id (foreign key)
message_type (enum: initial, follow_up_1, follow_up_2, reply, manual)
direction (enum: outbound, inbound)
subject
body (text)
sent_at
opened_at
clicked_at
replied_at
reply_classification (enum: interested, not_interested, needs_info, neutral)
needs_human_review (boolean)
reviewed_at
reviewer_notes (text)
```

#### **email_templates**
```sql
id (UUID, primary key)
name
template_type (enum: initial, follow_up_1, follow_up_2)
subject_template (text)
body_template (text)
variables (JSON array)
active (boolean)
created_at
updated_at
```

---

## Recommendation Algorithm Details

### Scoring System

**Academic Fit Score (0-100):**
```
if student_gpa >= school_avg_gpa + 0.3:
    score = 90-100 (strong fit)
elif student_gpa >= school_avg_gpa:
    score = 75-89 (good fit)
elif student_gpa >= school_avg_gpa - 0.2:
    score = 60-74 (possible fit)
else:
    score = 0-59 (reach)
```

**Athletic Competitiveness Score (0-100):**
- Consider student's club level (ECNL vs local club)
- Stats relative to position
- Division requested vs program division
- Program's competitive level (national ranking, conference strength)

**Geographic Score (0-100):**
- Exact match to preferred states: 100
- Same region: 75
- Adjacent region: 50
- Distance-based scoring if specific radius given

**Financial Score (0-100):**
- Net cost after typical aid <= budget: 100
- Net cost <= budget + 20%: 75
- Net cost <= budget + 50%: 50
- Over budget significantly: 0-25

**Program Quality Score (0-100):**
- Based on recent success, facilities, coaching stability
- NCAA tournament appearances
- Conference championships
- Professional player development

### AI Recommendations Prompt Structure
```
You are a college soccer recruiting advisor. Given the following student profile:
[Insert student data]

And the following college program data:
[Insert college data]

Generate a match score (0-100) and explanation considering:
1. Academic compatibility
2. Athletic level match
3. Geographic fit
4. Financial feasibility
5. Program culture and style

Provide output as JSON with score and reasoning.
```

---

## Email Generation System

### Prompt Engineering for Personalized Emails

**Initial Email Prompt:**
```
Generate a personalized recruiting email from [student_name], a [position] graduating in [year].

Student Profile:
- GPA: [gpa]
- SAT/ACT: [scores]
- Club: [club_team]
- Stats: [stats]
- Major Interest: [major]
- Highlight Video: [url]

Target School: [school_name]
Coach: [coach_name]
Program Details: [recent_record, conference, notable_info]

Requirements:
- Professional but genuine tone
- 200-250 words
- Express specific interest in THIS program (mention recent success, playing style, or specific detail)
- Include key stats and academic profile
- Request feedback on fit and recruiting timeline
- Include highlight video link naturally
- Subject line that stands out but isn't gimmicky

DO NOT:
- Use generic template language
- Over-praise or be overly effusive
- Make unrealistic claims
- Be too formal or stiff
```

**Follow-up Email Prompts:**
Similar structure but adjusted for:
- Context of no response
- New achievements/updates since last contact
- Softer ask (expressing continued interest vs initial introduction)

### Email Deliverability Best Practices
- Warm up email sending domain gradually
- Personalized "from" addresses (player's name)
- Authentic subject lines (not marketing-style)
- Plain text or minimal HTML
- Proper SPF, DKIM, DMARC records
- Monitor bounce and spam complaint rates
- Respect opt-outs immediately

---

## Content Generation Features

Based on your flowchart's right side, the system can also generate:

### **Video Content:**
- Highlight reel editing with AI tools
- Thumbnail generation
- Video hosting integration

### **Study Materials:**
- School comparison sheets
- Recruiting timeline guides
- Email templates for parents

### **Profile Materials:**
- Digital recruiting profiles (PDF)
- One-page athlete summaries
- Social media graphics

### **Blog/Content Feed:**
- Recruiting tips
- Success stories
- Timeline reminders
- College spotlight posts

---

## Key Features to Build

### MVP (Phase 1):
1. Student profile creation
2. Basic college database (top 100 D1 schools)
3. Manual college selection
4. AI email generation
5. Manual email sending
6. Basic reply tracking

### Version 2:
1. Full college database (all divisions)
2. AI recommendation engine
3. Automated email sending
4. Follow-up sequences
5. Reply classification
6. Admin dashboard

### Version 3:
1. Advanced analytics
2. Video content generation
3. Mobile app
4. Parent portal
5. Integration with recruiting platforms
6. Coach feedback system

---

## Potential Challenges & Solutions

### Challenge: Email Deliverability
**Solution:**
- Use reputable email service
- Implement gradual sending ramp-up
- Monitor sender reputation
- Use student's personal email as reply-to
- Keep volume reasonable (not spam-like)

### Challenge: Coach Contact Accuracy
**Solution:**
- Regular database updates
- Email verification service
- Bounce handling and cleanup
- Crowdsourced corrections from users

### Challenge: Generic-Sounding AI Emails
**Solution:**
- Extensive prompt engineering
- Include specific, researchable details about programs
- Human review of first few emails per student
- A/B testing of templates
- Feedback loop from coaches

### Challenge: Students Not Following Up on Replies
**Solution:**
- Mobile notifications
- Email alerts
- Dashboard showing "action needed" items
- Suggested response templates
- Optional rep assistance

### Challenge: Legal/Compliance (NCAA Rules)
**Solution:**
- Research NCAA recruiting contact rules
- Implement restrictions by graduation year
- Add disclaimers
- Consult with compliance expert
- Stay updated on rule changes

---

## Monetization Options

1. **Freemium Model:**
   - Free: 5 schools, basic emails
   - Pro ($29-49/mo): Unlimited schools, full automation, analytics
   - Premium ($99-149/mo): Rep assistance, profile creation, video editing

2. **Per-Campaign Pricing:**
   - $99 per 10-school campaign
   - $249 per 30-school campaign
   - Add-ons for profile creation, video editing

3. **School Partnerships:**
   - High schools/clubs can purchase licenses
   - Bulk pricing for club teams

4. **Coach Side Revenue:**
   - Premium listings for colleges
   - Enhanced profiles in recommendation engine
   - Analytics on recruiting funnel

---

## Next Steps

1. **Validate Assumptions:**
   - Interview ECNL players and parents
   - Talk to college coaches about preferences
   - Research NCAA recruiting rules thoroughly

2. **Build MVP:**
   - Start with manual process to prove concept
   - Focus on email quality over automation
   - Get 5-10 beta users

3. **Iterate Based on Feedback:**
   - Track response rates
   - Measure which emails get replies
   - Refine recommendation algorithm

4. **Scale Gradually:**
   - Add automation incrementally
   - Build coach database organically
   - Expand division coverage based on demand

---

## Success Metrics

- **Response Rate:** % of coaches who reply (target: 20-30%)
- **Interest Rate:** % of positive replies (target: 40-50% of replies)
- **Conversion Rate:** % leading to calls/visits (target: 10-15% of contacts)
- **Student Satisfaction:** NPS score
- **Email Quality:** Manual review scores, coach feedback
- **System Reliability:** Uptime, deliverability rate