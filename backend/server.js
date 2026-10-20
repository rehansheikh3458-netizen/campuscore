import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import classRoutes from './routes/classRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import statRoutes from './routes/statRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check & status endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'CampusCore — Student Management System API',
    version: '1.0.0',
    database: isDbConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/export', exportRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Global error handler
app.use(errorHandler);

// Start server and connect to database
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 CampusCore Backend running on http://localhost:${PORT}`);
    console.log(`📋 API Health Check: http://localhost:${PORT}/api/health`);
  });
};

startServer();

export default app;
