import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Read scraped data
  const dataDir = path.join(__dirname, '../../../data');
  const collegesData = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'colleges_attending.json'), 'utf-8')
  );
  const scheduleData = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'mvla_b10_schedule_summary.json'), 'utf-8')
  );

  // 1. Create Event
  console.log('📅 Creating ECNL Phoenix Event...');

  // Find existing event by externalEventId or create new one
  let event = await prisma.event.findFirst({
    where: {
      externalEventId: '4046',
    },
  });

  if (!event) {
    event = await prisma.event.create({
      data: {
        name: 'ECNL Phoenix 2025',
        startDate: new Date('2025-11-21'),
        endDate: new Date('2025-11-23'),
        location: 'Phoenix, AZ',
        venue: 'Reata Sports Complex',
        eventType: 'ECNL',
        externalEventId: '4046',
      },
    });
    console.log(`✅ Event created: ${event.name} (${event.id})\n`);
  } else {
    console.log(`✅ Event already exists: ${event.name} (${event.id})\n`);
  }

  // 2. Import Colleges and Coaches
  console.log('🏫 Importing colleges and coaches...');
  let collegeCount = 0;
  let coachCount = 0;

  for (const collegeData of collegesData) {
    // Extract city and state from location (e.g., "Amherst, MA")
    const locationParts = collegeData.location?.split(', ') || ['', ''];
    const city = locationParts[0] || '';
    const state = locationParts[1] || '';

    // Create or update college
    const college = await prisma.college.upsert({
      where: {
        name_division: {
          name: collegeData.name,
          division: collegeData.division,
        },
      },
      update: {},
      create: {
        name: collegeData.name,
        division: collegeData.division,
        conference: collegeData.conference || null,
        city: city,
        state: state,
        schoolType: collegeData.type || null,
        website: collegeData.website || null,
      },
    });
    collegeCount++;

    // Create coaches for this college
    if (collegeData.coaches && Array.isArray(collegeData.coaches)) {
      for (const coachData of collegeData.coaches) {
        // Check if coach already exists for this college
        const existingCoach = await prisma.coach.findFirst({
          where: {
            collegeId: college.id,
            fullName: coachData.name,
          },
        });

        if (!existingCoach) {
          await prisma.coach.create({
            data: {
              collegeId: college.id,
              fullName: coachData.name,
              title: coachData.title || 'Coach',
              email: coachData.email || null,
              phone: coachData.phone || null,
            },
          });
          coachCount++;
        }
      }
    }

    // Create EventAttendance (college attending the event)
    // Check if attendance already exists
    const existingAttendance = await prisma.eventAttendance.findFirst({
      where: {
        eventId: event.id,
        collegeId: college.id,
        coachId: null,
      },
    });

    if (!existingAttendance) {
      await prisma.eventAttendance.create({
        data: {
          eventId: event.id,
          collegeId: college.id,
          coachId: null,
        },
      });
    }
  }

  console.log(`✅ Imported ${collegeCount} colleges`);
  console.log(`✅ Imported ${coachCount} coaches\n`);

  // 3. Display summary
  console.log('📊 Database Summary:');
  const totalColleges = await prisma.college.count();
  const totalCoaches = await prisma.coach.count();
  const totalEvents = await prisma.event.count();
  const totalAttendance = await prisma.eventAttendance.count();

  console.log(`   - Events: ${totalEvents}`);
  console.log(`   - Colleges: ${totalColleges}`);
  console.log(`   - Coaches: ${totalCoaches}`);
  console.log(`   - Event Attendance Records: ${totalAttendance}`);

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
