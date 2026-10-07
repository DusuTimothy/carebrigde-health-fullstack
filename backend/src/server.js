import http from 'node:http';
import https from 'node:https';
import app from './app.js';
import { initializeDatabase } from './config/database.js';
import { ensureActiveTls, loadActiveTls } from './services/tlsService.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const TLS_PORT = Number(process.env.TLS_PORT) || 5443;

const startServer = async () => {
  try {
    console.log('\nConnecting to PostgreSQL...');
    await initializeDatabase();

    await ensureActiveTls();
    const tls = await loadActiveTls();

    if (tls) {
      https.createServer(tls, app).listen(TLS_PORT, () => {
        console.log(`Hospital API HTTPS served on https://localhost:${TLS_PORT} (TLS material loaded from the database)`);
      });
    }

    http.createServer(app).listen(PORT, () => {
      console.log(`Hospital API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;