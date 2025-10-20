const Reservation = require('../models/Reservation');

// create reservation...
exports.createReservation = async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: reservation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// get reservations
exports.getReservations = async (req, res) => {
  try {
    const { date, status, table_id } = req.query;
    const reservations = await Reservation.findAll({ date, status, table_id });
    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.getReservationDetails = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.updateReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.updateStatus(reservationId, status);
    res.json({
      success: true,
      message: 'Reservation status updated successfully',
      data: reservation
    });
  } catch (error) {
    if (error.message === 'Reservation not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.updateReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.update(reservationId, req.body);
    res.json({
      success: true,
      message: 'Reservation updated successfully',
      data: reservation
    });
  } catch (error) {
    if (error.message === 'Reservation not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.deleteReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.delete(reservationId);
    res.json({
      success: true,
      message: 'Reservation deleted successfully',
      data: reservation
    });
  } catch (error) {
    if (error.message === 'Reservation not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.getUpcomingReservations = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const reservations = await Reservation.getUpcomingReservations(parseInt(hours));
    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.getReservationDetails = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.updateReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.update(reservationId, req.body);
    res.json({
      success: true,
      message: 'Reservation updated successfully',
      data: reservation
    });
  } catch (error) {
    if (error.message === 'Reservation not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.updateReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.updateStatus(reservationId, status);
    res.json({
      success: true,
      message: 'Reservation status updated successfully',
      data: reservation
    });
  } catch (error) {
    if (error.message === 'Reservation not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

//--delete reservation
exports.deleteReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.delete(reservationId);
    res.json({
      success: true,
      message: 'Reservation deleted successfully',
      data: reservation
    });
  } catch (error) {
    if (error.message === 'Reservation not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};