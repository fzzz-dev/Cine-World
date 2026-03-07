// ⚠️  'dotenv/config' MUST be the very first import.
// ES modules hoist all imports and evaluate them depth-first before any
// top-level code runs — so dotenv.config() called after imports fires
// too late and every module initialises with undefined env vars.
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'CineBlood API running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler — surfaces real error messages instead of a blank 500
app.use((err, req, res, next) => {
  console.error('🔴 Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`\n✦ CineBlood Server running on port ${PORT}`);
  console.log(`  Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME || '⚠️  NOT SET'}`);
  console.log(`  MongoDB:          ${process.env.MONGO_URI ? 'configured' : '⚠️  NOT SET'}\n`);
});