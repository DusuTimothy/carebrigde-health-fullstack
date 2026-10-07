import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { authenticate } from './middleware/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import wardRoutes from './routes/wardRoutes.js';
import bedRoutes from './routes/bedRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import laboratoryRoutes from './routes/laboratoryRoutes.js';
import productCategoryRoutes from './routes/productCategoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import checkinRoutes from './routes/checkinRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import bootstrapRoutes from './routes/bootstrapRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import tlsRoutes from './routes/tlsRoutes.js';

const app = express();

// Trust proxy for production (behind load balancer/CDN)
app.set('trust proxy', process.env.APP_TRUST_PROXY === 'true' ? 1 : false);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting (stricter in production, generous in development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 100 : 2000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

// Request logging
app.use(morgan('combined'));

// CORS configuration (origin comes from env; comma-separated list supported)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hospital API is running',
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Public read + image routes (image uploads still require authentication via the router)
app.use('/api/public', publicRoutes);
app.use('/api/images', imageRoutes);
// TLS/CA material (active CA cert is public; everything else is admin-only in the router)
app.use('/api/tls', tlsRoutes);

// Protect every API route except the public/auth endpoints above.
app.use('/api', authenticate);

app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/bootstrap', bootstrapRoutes);
app.use('/api/content', contentRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;