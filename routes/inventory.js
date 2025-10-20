const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// GET /api/inventory
router.get('/', inventoryController.getInventory);

// GET /api/inventory/low-stock 
router.get('/low-stock', inventoryController.getLowStockAlerts);

// GET /api/inventory/categories
router.get('/categories', inventoryController.getInventoryCategories);

// GET /api/inventory/stats 
router.get('/stats', inventoryController.getInventoryStats);

// GET /api/inventory/:id 
router.get('/:id', inventoryController.getInventoryItem);

// POST /api/inventory 
router.post('/', inventoryController.createInventoryItem);

// PUT /api/inventory/:id 
router.put('/:id', inventoryController.updateInventory);

// PATCH /api/inventory/:id
router.patch('/:id', inventoryController.updateInventory);

// PATCH /api/inventory/:id/stock 
router.patch('/:id/stock', inventoryController.updateInventoryStock);

// DELETE /api/inventory/:id 
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router;