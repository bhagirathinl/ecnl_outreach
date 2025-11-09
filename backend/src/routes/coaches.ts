import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/coaches - List coaches with optional filters
router.get('/', async (req, res) => {
  try {
    const { collegeId, search } = req.query;

    const whereClause: any = {};

    if (collegeId) {
      whereClause.collegeId = collegeId as string;
    }

    if (search) {
      whereClause.OR = [
        {
          fullName: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          title: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    const coaches = await prisma.coach.findMany({
      where: whereClause,
      include: {
        college: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    res.json({
      success: true,
      count: coaches.length,
      coaches,
    });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coaches',
    });
  }
});

// GET /api/coaches/:id - Get specific coach
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const coach = await prisma.coach.findUnique({
      where: { id },
      include: {
        college: true,
        attendance: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!coach) {
      return res.status(404).json({
        success: false,
        error: 'Coach not found',
      });
    }

    res.json({
      success: true,
      coach,
    });
  } catch (error) {
    console.error('Error fetching coach:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coach',
    });
  }
});

export default router;
