const db = require('../config/database');

class Order {

  //--
  static async findAll(filters = {}) {
    const { status, date, table_id } = filters;
    
    let query = `
      SELECT 
        o.*, 
        t.table_number,
        t.capacity,
        t.location,
        COUNT(oi.id) as items_count,
        SUM(oi.quantity) as total_items
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      conditions.push(`o.status = $${paramCount}`);
      params.push(status);
    }

    if (date) {
      paramCount++;
      conditions.push(`DATE(o.created_at) = $${paramCount}`);
      params.push(date);
    }

    if (table_id) {
      paramCount++;
      conditions.push(`o.table_id = $${paramCount}`);
      params.push(table_id);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY o.id, t.table_number, t.capacity, t.location 
               ORDER BY o.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  //-- by id....
  static async findById(id) {
    const orderResult = await db.query(
      `SELECT o.*, t.table_number, t.capacity, t.location
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    const itemsResult = await db.query(
      `SELECT 
         oi.*, 
         mi.name,
         mi.category,
         mi.image_url
       FROM order_items oi
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = $1`,
      [id]
    );

    order.items = itemsResult.rows;
    return order;
  }

  //----
  static async create(orderData) {
    const { table_id, items, order_type = 'dine-in', customer_notes } = orderData;
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      //check..
      const tableCheck = await client.query(
        'SELECT status FROM tables WHERE id = $1',
        [table_id]
      );

      if (tableCheck.rows.length === 0) {
        throw new Error('Table not found');
      }

      if (tableCheck.rows[0].status !== 'available') {
        throw new Error('Table is not available');
      }

      let total_amount = 0;
      const orderItems = [];

      // 
      for (const item of items) {
        const menuItemResult = await client.query(
          `SELECT m.* 
           FROM menu_items m
           WHERE m.id = $1 AND m.is_available = true`,
          [item.menu_item_id]
        );

        if (menuItemResult.rows.length === 0) {
          throw new Error(`Menu item ${item.menu_item_id} not available`);
        }

        const menuItem = menuItemResult.rows[0];
        const itemTotal = menuItem.price * item.quantity;
        total_amount += itemTotal;

        orderItems.push({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: menuItem.price,
          special_instructions: item.special_instructions || null
        });
      }

      // إنشاء رقم طلب فريد
      const orderNumber = `ORD${Date.now()}`;
      
      //
      const orderResult = await client.query(
        `INSERT INTO orders (table_id, total_amount, order_type, customer_notes, order_number) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [table_id, total_amount, order_type, customer_notes || null, orderNumber] // 5 معاملات
      );

      const order = orderResult.rows[0];

      // 
      for (const item of orderItems) {
        await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, price, special_instructions) 
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.menu_item_id, item.quantity, item.price, item.special_instructions]
        );
      }

      
      await client.query(
        'UPDATE tables SET status = $1 WHERE id = $2',
        ['occupied', table_id]
      );

      await client.query('COMMIT');

      
      const finalOrder = await this.findById(order.id);
      return finalOrder;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Order creation error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    try {
      const orderResult = await db.query(
        `SELECT o.*, t.table_number
         FROM orders o
         LEFT JOIN tables t ON o.table_id = t.id
         WHERE o.id = $1`,
        [id]
      );

      if (orderResult.rows.length === 0) {
        return null;
      }

      const order = orderResult.rows[0];

      const itemsResult = await db.query(
        `SELECT oi.*, mi.name, mi.category
         FROM order_items oi
         LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE oi.order_id = $1`,
        [id]
      );

      order.items = itemsResult.rows;
      return order;

    } catch (error) {
      console.error('Error finding order by id:', error);
      throw error;
    }
  }

  //--
  static async updateStatus(id, status) {
    try {
      console.log(`Updating order ${id} to status: ${status}`);
      
      const orderId = parseInt(id);
      if (isNaN(orderId)) {
        throw new Error('Invalid order ID');
      }

      const result = await db.query(
        `UPDATE orders 
         SET status = $1 
         WHERE id = $2 
         RETURNING *`,
        [status, orderId]
      );

      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  //--
  static async updateInventoryForOrder(menuItemId, quantity, client) {
    const ingredients = await client.query(
      `SELECT inventory_item_id, quantity 
       FROM menu_ingredients 
       WHERE menu_item_id = $1`,
      [menuItemId]
    );

    for (const ingredient of ingredients.rows) {
      await client.query(
        `UPDATE inventory 
         SET current_stock = current_stock - ($1 * $2),
             is_low_stock = (current_stock - ($1 * $2)) <= minimum_stock
         WHERE id = $3`,
        [ingredient.quantity, quantity, ingredient.inventory_item_id]
      );
    }
  }

  //--
  static async getOrderStats(date = new Date().toISOString().split('T')[0]) {
    const statsResult = await db.query(
      `SELECT 
         COUNT(*) as total_orders,
         SUM(total_amount) as total_sales,
         AVG(total_amount) as average_order_value,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
         COUNT(CASE WHEN status = 'served' THEN 1 END) as served_orders
       FROM orders 
       WHERE DATE(created_at) = $1`,
      [date]
    );

    const hourlyResult = await db.query(
      `SELECT 
         EXTRACT(HOUR FROM created_at) as hour,
         COUNT(*) as orders_count,
         SUM(total_amount) as hourly_sales
       FROM orders
       WHERE DATE(created_at) = $1
       GROUP BY EXTRACT(HOUR FROM created_at)
       ORDER BY hour`,
      [date]
    );

    return {
      summary: statsResult.rows[0] || {},
      hourly: hourlyResult.rows
    };
  }
}

module.exports = Order;