const Order = require('../models/Order');

//-- create order...
exports.createOrder = async (req, res) => {
     // order_number...
    if (!req.body.order_number) {
      req.body.order_number = `ORD${Date.now()}`;
    }
  try {
    const order = await Order.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

//-- get orders....
exports.getOrders = async (req, res) => {
  try {
    const { status, date, table_id } = req.query;
    const orders = await Order.findAll({ status, date, table_id });
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//-- get orders details...
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//-- update order status....
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = await Order.updateStatus(orderId, status);
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    if (error.message === 'Order not found') {
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

// get order status...
exports.getOrderStats = async (req, res) => {
  try {
    const { date } = req.query;
    const stats = await Order.getOrderStats(date);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};