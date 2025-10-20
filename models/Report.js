const db = require('../config/database');

class Report {

  //--
  static async getDailySales(date = new Date().toISOString().split('T')[0]) {
    const salesResult = await db.query(
      `SELECT 
         COUNT(*) as total_orders,
         SUM(total_amount) as total_sales,
         AVG(total_amount) as average_order_value,
         MIN(total_amount) as min_order_value,
         MAX(total_amount) as max_order_value
       FROM orders 
       WHERE DATE(created_at) = $1 
         AND status = 'served'`,
      [date]
    );

    const categoryResult = await db.query(
      `SELECT 
         mi.category,
         SUM(oi.quantity) as items_sold,
         SUM(oi.quantity * oi.price) as category_revenue
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       JOIN orders o ON oi.order_id = o.id
       WHERE DATE(o.created_at) = $1 AND o.status = 'served'
       GROUP BY mi.category
       ORDER BY category_revenue DESC`,
      [date]
    );

    const hourlyResult = await db.query(
      `SELECT 
         EXTRACT(HOUR FROM created_at) as hour,
         COUNT(*) as orders_count,
         SUM(total_amount) as hourly_sales
       FROM orders
       WHERE DATE(created_at) = $1 AND status = 'served'
       GROUP BY EXTRACT(HOUR FROM created_at)
       ORDER BY hour`,
      [date]
    );

    return {
      date,
      summary: salesResult.rows[0] || {},
      byCategory: categoryResult.rows,
      byHour: hourlyResult.rows
    };
  }

  //--
  static async getInventoryReports() {
    const lowStockResult = await db.query(
      `SELECT * FROM inventory 
       WHERE is_low_stock = true 
       ORDER BY (current_stock / minimum_stock) ASC`
    );

    const categoryResult = await db.query(
      `SELECT 
         category,
         COUNT(*) as item_count,
         SUM(current_stock * unit_price) as total_value,
         COUNT(CASE WHEN is_low_stock THEN 1 END) as low_stock_count
       FROM inventory 
       GROUP BY category 
       ORDER BY total_value DESC`
    );

    return {
      lowStockItems: lowStockResult.rows,
      byCategory: categoryResult.rows
    };
  }

  //--
  static async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];

    const ordersStats = await db.query(
      `SELECT 
         COUNT(*) as today_orders,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
         SUM(CASE WHEN status = 'served' THEN total_amount ELSE 0 END) as today_sales
       FROM orders 
       WHERE DATE(created_at) = $1`,
      [today]
    );

    const tablesStats = await db.query(
      `SELECT 
         COUNT(*) as total_tables,
         SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as active_tables
       FROM tables`
    );

    const inventoryStats = await db.query(
      `SELECT COUNT(*) as low_stock_items 
       FROM inventory 
       WHERE is_low_stock = true`
    );

    const reservationsStats = await db.query(
      `SELECT COUNT(*) as today_reservations 
       FROM reservations 
       WHERE DATE(reservation_date) = $1 
         AND status = 'confirmed'`,
      [today]
    );

    return {
      today_orders: parseInt(ordersStats.rows[0]?.today_orders) || 0,
      today_sales: parseFloat(ordersStats.rows[0]?.today_sales) || 0,
      pending_orders: parseInt(ordersStats.rows[0]?.pending_orders) || 0,
      active_tables: parseInt(tablesStats.rows[0]?.active_tables) || 0,
      total_tables: parseInt(tablesStats.rows[0]?.total_tables) || 0,
      low_stock_items: parseInt(inventoryStats.rows[0]?.low_stock_items) || 0,
      today_reservations: parseInt(reservationsStats.rows[0]?.today_reservations) || 0
    };
  }
}

module.exports = Report;