const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders 
router.post('/', orderController.createOrder);

// GET /api/orders 
router.get('/', orderController.getOrders);

// GET /api/orders/stats 
router.get('/stats', orderController.getOrderStats);

// GET /api/orders/:orderId 
router.get('/:orderId', orderController.getOrderDetails);

// PATCH /api/orders/:orderId/status 
router.patch('/:orderId/status', orderController.updateOrderStatus);

module.exports = router;