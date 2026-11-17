import { Router } from 'express';
import { roomController } from '../controllers/roomController.js';
import { equipmentController } from '../controllers/equipmentController.js';
import { bookingController } from '../controllers/bookingController.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'SoundBox Studios API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Catálogo de Salas
router.get('/rooms', (req, res) => roomController.getAll(req, res));
router.get('/rooms/:id', (req, res) => roomController.getById(req, res));
router.get('/rooms/:id/availability', (req, res) => roomController.getAvailability(req, res));

// Catálogo de Equipamiento
router.get('/equipment', (req, res) => equipmentController.getAll(req, res));

// Reservas
router.post('/reservations/quote', (req, res) => bookingController.quote(req, res));
router.post('/reservations', (req, res) => bookingController.create(req, res));
router.get('/reservations/:code', (req, res) => bookingController.getByCode(req, res));
router.post('/reservations/:code/check-in', (req, res) => bookingController.checkIn(req, res));
router.post('/reservations/:code/cancel', (req, res) => bookingController.cancel(req, res));

// Panel Admin
router.get('/admin/timeline', (req, res) => bookingController.getAdminTimeline(req, res));

export default router;
