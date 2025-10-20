const db = require('../config/database');

class Table {

  //--
  static async findAll() {
    const result = await db.query(`
      SELECT 
        t.*,
        COUNT(CASE WHEN o.status NOT IN ('served', 'cancelled') THEN 1 END) as active_orders,
        json_agg(
          DISTINCT json_build_object(
            'reservation_id', r.id,
            'customer_name', r.customer_name,
            'reservation_date', r.reservation_date,
            'status', r.status
          )
        ) as upcoming_reservations
      FROM tables t
      LEFT JOIN orders o ON t.id = o.table_id
      LEFT JOIN reservations r ON t.id = r.table_id 
        AND r.reservation_date BETWEEN NOW() AND NOW() + INTERVAL '4 hours'
        AND r.status = 'confirmed'
      GROUP BY t.id
      ORDER BY t.table_number
    `);

    return result.rows;
  }

  //--
  static async findById(id) {
    const result = await db.query(
      `SELECT 
         t.*,
         json_agg(
           DISTINCT json_build_object(
             'order_id', o.id,
             'order_number', o.order_number,
             'status', o.status,
             'total_amount', o.total_amount
           )
         ) as current_orders
       FROM tables t
       LEFT JOIN orders o ON t.id = o.table_id AND o.status NOT IN ('served', 'cancelled')
       WHERE t.id = $1
       GROUP BY t.id`,
      [id]
    );

    return result.rows[0] || null;
  }


  //--
  static async findAvailable(reservationDate, partySize) {
    const twoHoursBefore = new Date(reservationDate.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAfter = new Date(reservationDate.getTime() + 2 * 60 * 60 * 1000);

    const result = await db.query(
      `SELECT t.* 
       FROM tables t
       WHERE t.capacity >= $1 
         AND t.status = 'available'
         AND t.id NOT IN (
           SELECT r.table_id 
           FROM reservations r 
           WHERE r.reservation_date BETWEEN $2 AND $3 
             AND r.status IN ('confirmed', 'seated')
         )
       ORDER BY t.capacity ASC`,
      [partySize, twoHoursBefore, twoHoursAfter]
    );

    return result.rows;
  }

  //--
  static async updateStatus(id, status) {
    const result = await db.query(
      'UPDATE tables SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Table not found');
    }

    return result.rows[0];
  }

  // --
  static async create(tableData) {
    const { table_number, capacity, location, status = 'available' } = tableData;
    
    const result = await db.query(
      `INSERT INTO tables (table_number, capacity, location, status) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [table_number, capacity, location, status]
    );

    return result.rows[0];
  }

  //
  static async update(id, updateData) {
    const { table_number, capacity, location, status } = updateData;
    
    const result = await db.query(
      `UPDATE tables 
       SET table_number = COALESCE($1, table_number),
           capacity = COALESCE($2, capacity),
           location = COALESCE($3, location),
           status = COALESCE($4, status)
       WHERE id = $5 RETURNING *`,
      [table_number, capacity, location, status, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Table not found');
    }

    return result.rows[0];
  }

  //
  static async delete(id) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      const orderCheck = await client.query(
        'SELECT 1 FROM orders WHERE table_id = $1 AND status NOT IN ($2, $3) LIMIT 1',
        [id, 'served', 'cancelled']
      );

      if (orderCheck.rows.length > 0) {
        throw new Error('Cannot delete table with active orders');
      }

      const reservationCheck = await client.query(
        'SELECT 1 FROM reservations WHERE table_id = $1 AND reservation_date > NOW() LIMIT 1',
        [id]
      );

      if (reservationCheck.rows.length > 0) {
        throw new Error('Cannot delete table with future reservations');
      }

      const deleteResult = await client.query(
        'DELETE FROM tables WHERE id = $1 RETURNING *',
        [id]
      );

      if (deleteResult.rows.length === 0) {
        throw new Error('Table not found');
      }

      await client.query('COMMIT');
      return deleteResult.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Table;