import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/colleges - List colleges with optional filters
router.get('/', async (req, res) => {
  try {
    const { division, state, search } = req.query;

    const whereClause: any = {};

    if (division) {
      whereClause.division = division as string;
    }

    if (state) {
      whereClause.state = state as string;
    }

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          city: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    const colleges = await prisma.college.findMany({
      where: whereClause,
      include: {
        coaches: true,
        _count: {
          select: {
            attendance: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      count: colleges.length,
      colleges,
    });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch colleges',
    });
  }
});

// GET /api/colleges/:id - Get specific college
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        coaches: true,
        attendance: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        error: 'College not found',
      });
    }

    res.json({
      success: true,
      college,
    });
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch college',
    });
  }
});

// GET /api/colleges/stats/divisions - Get college counts by division
router.get('/stats/divisions', async (req, res) => {
  try {
    const divisions = await prisma.college.groupBy({
      by: ['division'],
      _count: {
        division: true,
      },
      orderBy: {
        division: 'asc',
      },
    });

    res.json({
      success: true,
      divisions,
    });
  } catch (error) {
    console.error('Error fetching division stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch division stats',
    });
  }
});

export default router;
