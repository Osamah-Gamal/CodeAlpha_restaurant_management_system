const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// POST /api/reservations 
router.post('/', reservationController.createReservation);

// GET /api/reservations 
router.get('/', reservationController.getReservations);

// GET /api/reservations/upcoming
router.get('/upcoming', reservationController.getUpcomingReservations);

// GET /api/reservations/:reservationId 
router.get('/:reservationId', reservationController.getReservationDetails);

// PUT /api/reservations/:reservationId 
router.put('/:reservationId', reservationController.updateReservation);

// PATCH /api/reservations/:reservationId/status 
router.patch('/:reservationId/status', reservationController.updateReservationStatus);

// DELETE /api/reservations/:reservationId 
router.delete('/:reservationId', reservationController.deleteReservation);

module.exports = router;