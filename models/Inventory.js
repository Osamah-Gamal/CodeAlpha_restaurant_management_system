const db = require('../config/database');

class Inventory {

  //--
  static async findAll(filters = {}) {
    const { lowStock, category } = filters;
    
    let query = 'SELECT * FROM inventory';
    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (lowStock === 'true') {
      paramCount++;
      conditions.push(`is_low_stock = $${paramCount}`);
      params.push(true);
    }

    if (category) {
      paramCount++;
      conditions.push(`category = $${paramCount}`);
      params.push(category);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY name';

    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM inventory WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  //--
  static async create(inventoryData) {
    const { name, category, current_stock, minimum_stock, unit, unit_price, supplier } = inventoryData;
    
    const result = await db.query(
      `INSERT INTO inventory 
       (name, category, current_stock, minimum_stock, unit, unit_price, supplier, is_low_stock) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $3 <= $4) RETURNING *`,
      [name, category, current_stock, minimum_stock, unit, unit_price, supplier]
    );

    return result.rows[0];
  }

  //--
  static async update(id, updateData) {
    const { name, category, current_stock, minimum_stock, unit, unit_price, supplier } = updateData;
    
    const result = await db.query(
      `UPDATE inventory 
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           current_stock = COALESCE($3, current_stock),
           minimum_stock = COALESCE($4, minimum_stock),
           unit = COALESCE($5, unit),
           unit_price = COALESCE($6, unit_price),
           supplier = COALESCE($7, supplier),
           is_low_stock = COALESCE($3, current_stock) <= COALESCE($4, minimum_stock),
           last_restocked = CASE 
             WHEN COALESCE($3, current_stock) > current_stock THEN NOW() 
             ELSE last_restocked 
           END
       WHERE id = $8 RETURNING *`,
      [name, category, current_stock, minimum_stock, unit, unit_price, supplier, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Inventory item not found');
    }

    return result.rows[0];
  }

  //--
  static async updateStock(id, quantityChange) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE inventory 
         SET current_stock = current_stock + $1,
             is_low_stock = (current_stock + $1) <= minimum_stock,
             last_restocked = CASE WHEN $1 > 0 THEN NOW() ELSE last_restocked END
         WHERE id = $2 RETURNING *`,
        [quantityChange, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Inventory item not found');
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
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      const menuCheck = await client.query(
        'SELECT 1 FROM menu_ingredients WHERE inventory_item_id = $1 LIMIT 1',
        [id]
      );

      if (menuCheck.rows.length > 0) {
        throw new Error('Cannot delete inventory item. It is used in menu items.');
      }

      const deleteResult = await client.query(
        'DELETE FROM inventory WHERE id = $1 RETURNING *',
        [id]
      );

      if (deleteResult.rows.length === 0) {
        throw new Error('Inventory item not found');
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

  //--
  static async getLowStockAlerts() {
    const result = await db.query(
      `SELECT * FROM inventory 
       WHERE is_low_stock = true 
       ORDER BY (current_stock / minimum_stock) ASC`
    );

    return result.rows;
  }

  //--
  static async getCategories() {
    const result = await db.query(
      `SELECT 
         category,
         COUNT(*) as item_count,
         SUM(current_stock * unit_price) as total_value
       FROM inventory 
       GROUP BY category 
       ORDER BY category`
    );

    return result.rows;
  }

  //--
  static async getInventoryStats() {
    const totalResult = await db.query(
      `SELECT 
         COUNT(*) as total_items,
         SUM(current_stock * unit_price) as total_value,
         COUNT(CASE WHEN is_low_stock THEN 1 END) as low_stock_items
       FROM inventory`
    );

    const categoryResult = await db.query(
      `SELECT 
         category,
         COUNT(*) as item_count,
         SUM(current_stock) as total_stock,
         SUM(current_stock * unit_price) as category_value
       FROM inventory 
       GROUP BY category 
       ORDER BY category_value DESC`
    );

    return {
      summary: totalResult.rows[0] || {},
      byCategory: categoryResult.rows
    };
  }
}

module.exports = Inventory;