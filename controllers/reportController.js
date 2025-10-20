const Report = require('../models/Report');

// get daily sales...
exports.getDailySales = async (req, res) => {
  try {
    const { date } = req.query;
    const salesReport = await Report.getDailySales(date);
    res.json({
      success: true,
      data: salesReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// get low stock alerts..
exports.getLowStockAlerts = async (req, res) => {
  try {
    const reports = await Report.getInventoryReports();
    res.json({
      success: true,
      data: reports.lowStockItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// get dashboard stats...
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await Report.getDashboardStats();
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

// get inventory reports....
exports.getInventoryReports = async (req, res) => {
  try {
    const reports = await Report.getInventoryReports();
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};