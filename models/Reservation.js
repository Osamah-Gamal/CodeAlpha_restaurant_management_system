const db = require('../config/database');

class Reservation {
  // الحصول على جميع الحجوزات
  static async findAll(filters = {}) {
    const { date, status, table_id } = filters;
    
    let query = `
      SELECT 
        r.*,
        t.table_number,
        t.capacity,
        t.location
      FROM reservations r
      LEFT JOIN tables t ON r.table_id = t.id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (date) {
      paramCount++;
      conditions.push(`DATE(r.reservation_date) = $${paramCount}`);
      params.push(date);
    }

    if (status) {
      paramCount++;
      conditions.push(`r.status = $${paramCount}`);
      params.push(status);
    }

    if (table_id) {
      paramCount++;
      conditions.push(`r.table_id = $${paramCount}`);
      params.push(table_id);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY r.reservation_date ASC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  // البحث عن حجز بالمعرف
  static async findById(id) {
    const result = await db.query(
      `SELECT 
         r.*,
         t.table_number,
         t.capacity,
         t.location
       FROM reservations r
       LEFT JOIN tables t ON r.table_id = t.id
       WHERE r.id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  // إنشاء حجز جديد
  static async create(reservationData) {
    const { 
      customer_name, 
      customer_phone, 
      customer_email, 
      table_id, 
      reservation_date, 
      party_size, 
      duration = 120, 
      special_requests 
    } = reservationData;

    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      // التحقق من توفر الطاولة
      const availabilityCheck = await client.query(
        `SELECT 1 FROM reservations 
         WHERE table_id = $1 
           AND reservation_date BETWEEN $2::timestamp - INTERVAL '2 hours' 
           AND $2::timestamp + INTERVAL '2 hours'
           AND status IN ('confirmed', 'seated')`,
        [table_id, reservation_date]
      );

      if (availabilityCheck.rows.length > 0) {
        throw new Error('Table is not available for the selected time');
      }

      // التحقق من سعة الطاولة
      const tableCheck = await client.query(
        'SELECT capacity FROM tables WHERE id = $1',
        [table_id]
      );

      if (tableCheck.rows.length === 0) {
        throw new Error('Table not found');
      }

      if (tableCheck.rows[0].capacity < party_size) {
        throw new Error('Table capacity is insufficient for the party size');
      }

      // إنشاء الحجز
      const result = await client.query(
        `INSERT INTO reservations 
         (customer_name, customer_phone, customer_email, table_id, 
          reservation_date, party_size, duration, special_requests) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [customer_name, customer_phone, customer_email, table_id, 
         reservation_date, party_size, duration, special_requests]
      );

      await client.query('COMMIT');
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // تحديث حالة الحجز
  static async updateStatus(id, status) {
    const result = await db.query(
      'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Reservation not found');
    }

    return result.rows[0];
  }

  // --
  static async update(id, updateData) {
    const { 
      customer_name, customer_phone, customer_email, table_id, 
      reservation_date, party_size, duration, special_requests, status 
    } = updateData;

    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      if (table_id || reservation_date) {
        const currentReservation = await this.findById(id);
        const targetTableId = table_id || currentReservation.table_id;
        const targetDate = reservation_date || currentReservation.reservation_date;

        const availabilityCheck = await client.query(
          `SELECT 1 FROM reservations 
           WHERE table_id = $1 
             AND reservation_date BETWEEN $2::timestamp - INTERVAL '2 hours' 
             AND $2::timestamp + INTERVAL '2 hours'
             AND status IN ('confirmed', 'seated')
             AND id != $3`,
          [targetTableId, targetDate, id]
        );

        if (availabilityCheck.rows.length > 0) {
          throw new Error('Table is not available for the selected time');
        }
      }

      const result = await client.query(
        `UPDATE reservations 
         SET customer_name = COALESCE($1, customer_name),
             customer_phone = COALESCE($2, customer_phone),
             customer_email = COALESCE($3, customer_email),
             table_id = COALESCE($4, table_id),
             reservation_date = COALESCE($5, reservation_date),
             party_size = COALESCE($6, party_size),
             duration = COALESCE($7, duration),
             special_requests = COALESCE($8, special_requests),
             status = COALESCE($9, status)
         WHERE id = $10 RETURNING *`,
        [customer_name, customer_phone, customer_email, table_id, 
         reservation_date, party_size, duration, special_requests, status, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Reservation not found');
      }

      await client.query('COMMIT');
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  //--
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM reservations WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Reservation not found');
    }

    return result.rows[0];
  }

  
  //--
  static async getUpcomingReservations(hours = 24) {
    const result = await db.query(
      `SELECT 
         r.*,
         t.table_number,
         t.capacity
       FROM reservations r
       LEFT JOIN tables t ON r.table_id = t.id
       WHERE r.reservation_date BETWEEN NOW() AND NOW() + INTERVAL '1 hour' * $1
         AND r.status = 'confirmed'
       ORDER BY r.reservation_date ASC`,
      [hours]
    );

    return result.rows;
  }
}

module.exports = Reservation;