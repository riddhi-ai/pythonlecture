import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { AutomationScheduler } from './jobs/cronJobs.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sseManager } from './services/sseService.js';
import jwt from 'jsonwebtoken';

// Routes
import authRoutes from './routes/authRoutes.js';
import collabRoutes from './routes/collabRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import scrapbookRoutes from './routes/scrapbookRoutes.js';
import automationRoutes from './routes/automationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Security & Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Creator Innovia API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Server-Sent Events (SSE) Stream for real-time live updates
app.get('/api/v1/events', (req, res) => {
  const token = (req.query.token as string) || req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'SSE requires authentication token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as {
      id: string;
      workspaceId: string;
    };
    sseManager.addClient(decoded.id, decoded.workspaceId, res);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token for SSE' });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/collaborations', collabRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/scrapbook', scrapbookRoutes);
app.use('/api/v1/automation', automationRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Centralized error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await connectDB();
    AutomationScheduler.init();

    const server = app.listen(ENV.PORT, () => {
      console.log(`===================================================`);
      console.log(`  📔 CREATOR INNOVIA SERVER STARTED ON PORT ${ENV.PORT}`);
      console.log(`  🌍 URL: http://localhost:${ENV.PORT}`);
      console.log(`  📊 Mode: ${ENV.NODE_ENV}`);
      console.log(`===================================================`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] MongoDB disconnected. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server Start Error]:', error);
    process.exit(1);
  }
}

startServer();
