const Table = require('../models/Table');

//--
exports.checkTableAvailability = async (req, res) => {
  try {
    const { date, time, partySize } = req.query;

    if (!date || !time || !partySize) {
      return res.status(400).json({
        success: false,
        error: 'Date, time, and partySize are required'
      });
    }

    const reservationDateTime = new Date(`${date}T${time}`);
    const availableTables = await Table.findAvailable(reservationDateTime, parseInt(partySize));

    res.json({
      success: true,
      data: availableTables,
      count: availableTables.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.findAll();
    res.json({
      success: true,
      data: tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.getTableDetails = async (req, res) => {
  try {
    const { tableId } = req.params;
    const table = await Table.findById(tableId);

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }

    res.json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.updateTableStatus = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { status } = req.body;

    const table = await Table.updateStatus(tableId, status);
    res.json({
      success: true,
      message: 'Table status updated successfully',
      data: table
    });
  } catch (error) {
    if (error.message === 'Table not found') {
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
exports.createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: table
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

//--
exports.updateTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const table = await Table.update(tableId, req.body);
    res.json({
      success: true,
      message: 'Table updated successfully',
      data: table
    });
  } catch (error) {
    if (error.message === 'Table not found') {
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
exports.deleteTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const table = await Table.delete(tableId);
    res.json({
      success: true,
      message: 'Table deleted successfully',
      data: table
    });
  } catch (error) {
    if (error.message === 'Table not found') {
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