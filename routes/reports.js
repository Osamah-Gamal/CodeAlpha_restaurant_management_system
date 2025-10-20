const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET /api/reports/daily-sales
router.get('/daily-sales', reportController.getDailySales);

// GET /api/reports/low-stock 
router.get('/low-stock', reportController.getLowStockAlerts);

// GET /api/reports/dashboard-stats 
router.get('/dashboard-stats', reportController.getDashboardStats);

// GET /api/reports/inventory 
router.get('/inventory', reportController.getInventoryReports);

module.exports = router;