import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routers
import eventsRouter from './routes/events';
import collegesRouter from './routes/colleges';
import coachesRouter from './routes/coaches';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mount API routers
app.use('/api/events', eventsRouter);
app.use('/api/colleges', collegesRouter);
app.use('/api/coaches', coachesRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'ECNL Outreach API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'ECNL Outreach API v1.0',
    endpoints: {
      health: '/health',
      events: '/api/events',
      colleges: '/api/colleges',
      coaches: '/api/coaches',
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API info: http://localhost:${PORT}/api`);
});

export default app;
