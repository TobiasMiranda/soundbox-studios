import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

export const app: Express = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configuración estricta de CORS según punto 5.8 de la consigna
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (ej. curl, Postman o tests locales)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('No permitido por la política CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Ruta base descriptiva
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'SoundBox Studios API',
    description: 'Sistema de Gestión y Reserva Inteligente de Salas de Ensayo',
    endpoints: {
      health: '/api/health',
      rooms: '/api/rooms',
      equipment: '/api/equipment',
      quote: 'POST /api/reservations/quote',
      createReservation: 'POST /api/reservations',
      lookupReservation: 'GET /api/reservations/:code',
      checkIn: 'POST /api/reservations/:code/check-in',
      cancel: 'POST /api/reservations/:code/cancel',
      adminTimeline: '/api/admin/timeline?date=YYYY-MM-DD',
    },
    documentation: 'Consulte spec.md y plan.md en el repositorio.',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[SoundBox API] Servidor activo en http://localhost:${PORT}`);
    console.log(`[SoundBox API] CORS configurado para orígenes autorizados.`);
  });
}

export default app;
