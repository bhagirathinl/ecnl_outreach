import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/events - List all events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startDate: 'desc',
      },
      include: {
        _count: {
          select: {
            attendance: true,
            games: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
    });
  }
});

// GET /api/events/:id - Get specific event with details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendance: {
          include: {
            college: true,
            coach: true,
          },
        },
        games: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event',
    });
  }
});

// GET /api/events/:id/colleges - Get colleges attending an event
router.get('/:id/colleges', async (req, res) => {
  try {
    const { id } = req.params;
    const { division } = req.query;

    const whereClause: any = {
      eventId: id,
    };

    if (division) {
      whereClause.college = {
        division: division as string,
      };
    }

    const attendance = await prisma.eventAttendance.findMany({
      where: whereClause,
      include: {
        college: {
          include: {
            coaches: true,
          },
        },
      },
      orderBy: {
        college: {
          name: 'asc',
        },
      },
    });

    const colleges = attendance.map((a) => ({
      ...a.college,
      coaches: a.college.coaches,
    }));

    res.json({
      success: true,
      count: colleges.length,
      colleges,
    });
  } catch (error) {
    console.error('Error fetching event colleges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch colleges for event',
    });
  }
});

export default router;
