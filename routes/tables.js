const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

// GET /api/tables/availability
router.get('/availability', tableController.checkTableAvailability);

// GET /api/tables
router.get('/', tableController.getTables);

// GET /api/tables/:tableId 
router.get('/:tableId', tableController.getTableDetails);

// POST /api/tables 
router.post('/', tableController.createTable);

// PUT /api/tables/:tableId 
router.put('/:tableId', tableController.updateTable);

// PATCH /api/tables/:tableId/status 
router.patch('/:tableId/status', tableController.updateTableStatus);

// DELETE /api/tables/:tableId 
router.delete('/:tableId', tableController.deleteTable);

module.exports = router;