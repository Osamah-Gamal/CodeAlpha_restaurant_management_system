const db = require('../config/database');

class MenuItem {
  
  //--
  static async findAll(filters = {}) {
    const { category, available } = filters;
    
    let query = `
      SELECT 
        m.*,
        json_agg(
          json_build_object(
            'ingredient_id', mi.inventory_item_id,
            'ingredient_name', inv.name,
            'quantity', mi.quantity,
            'unit', inv.unit
          )
        ) as ingredients
      FROM menu_items m
      LEFT JOIN menu_ingredients mi ON m.id = mi.menu_item_id
      LEFT JOIN inventory inv ON mi.inventory_item_id = inv.id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      conditions.push(`m.category = $${paramCount}`);
      params.push(category);
    }

    if (available !== undefined) {
      paramCount++;
      conditions.push(`m.is_available = $${paramCount}`);
      params.push(available);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY m.id ORDER BY m.category, m.name`;

    const result = await db.query(query, params);
    return result.rows;
  }

  // by id...
  static async findById(id) {
    const result = await db.query(
      `SELECT 
         m.*,
         json_agg(
           json_build_object(
             'ingredient_id', mi.inventory_item_id,
             'ingredient_name', inv.name,
             'current_stock', inv.current_stock,
             'quantity', mi.quantity,
             'unit', inv.unit
           )
         ) as ingredients
       FROM menu_items m
       LEFT JOIN menu_ingredients mi ON m.id = mi.menu_item_id
       LEFT JOIN inventory inv ON mi.inventory_item_id = inv.id
       WHERE m.id = $1
       GROUP BY m.id`,
      [id]
    );

    return result.rows[0] || null;
  }

  //--
  static async create(menuItemData) {
    const { name, description, price, category, image_url, preparation_time, ingredients } = menuItemData;
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      const menuItemResult = await client.query(
        `INSERT INTO menu_items 
         (name, description, price, category, image_url, preparation_time) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, description, price, category, image_url, preparation_time]
      );

      const menuItem = menuItemResult.rows[0];

      if (ingredients && ingredients.length > 0) {
        for (const ingredient of ingredients) {
          await client.query(
            `INSERT INTO menu_ingredients 
             (menu_item_id, inventory_item_id, quantity) 
             VALUES ($1, $2, $3)`,
            [menuItem.id, ingredient.inventory_item_id, ingredient.quantity]
          );
        }
      }

      await client.query('COMMIT');
      return menuItem;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  //--
  static async update(id, updateData) {
    const { name, description, price, category, image_url, preparation_time, is_available, ingredients } = updateData;
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      const updateResult = await client.query(
        `UPDATE menu_items 
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             price = COALESCE($3, price),
             category = COALESCE($4, category),
             image_url = COALESCE($5, image_url),
             preparation_time = COALESCE($6, preparation_time),
             is_available = COALESCE($7, is_available)
         WHERE id = $8 RETURNING *`,
        [name, description, price, category, image_url, preparation_time, is_available, id]
      );

      if (updateResult.rows.length === 0) {
        throw new Error('Menu item not found');
      }

      const menuItem = updateResult.rows[0];

      if (ingredients !== undefined) {
        await client.query(
          'DELETE FROM menu_ingredients WHERE menu_item_id = $1',
          [id]
        );

        for (const ingredient of ingredients) {
          await client.query(
            `INSERT INTO menu_ingredients 
             (menu_item_id, inventory_item_id, quantity) 
             VALUES ($1, $2, $3)`,
            [id, ingredient.inventory_item_id, ingredient.quantity]
          );
        }
      }

      await client.query('COMMIT');
      return menuItem;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  //--
  static async partialUpdate(id, updateData) {
    const { is_available, price, preparation_time, name, description } = updateData;
    
    const updates = [];
    const params = [];
    let paramCount = 0;

    if (is_available !== undefined) {
      paramCount++;
      updates.push(`is_available = $${paramCount}`);
      params.push(is_available);
    }

    if (price !== undefined) {
      paramCount++;
      updates.push(`price = $${paramCount}`);
      params.push(price);
    }

    if (preparation_time !== undefined) {
      paramCount++;
      updates.push(`preparation_time = $${paramCount}`);
      params.push(preparation_time);
    }

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(name);
    }

    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      params.push(description);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    paramCount++;
    params.push(id);

    const query = `
      UPDATE menu_items 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      throw new Error('Menu item not found');
    }

    return result.rows[0];
  }

  //--
  static async delete(id) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      const orderCheck = await client.query(
        'SELECT 1 FROM order_items WHERE menu_item_id = $1 LIMIT 1',
        [id]
      );

      if (orderCheck.rows.length > 0) {
        throw new Error('Cannot delete menu item. It is associated with existing orders.');
      }

      await client.query(
        'DELETE FROM menu_ingredients WHERE menu_item_id = $1',
        [id]
      );

      const deleteResult = await client.query(
        'DELETE FROM menu_items WHERE id = $1 RETURNING *',
        [id]
      );

      if (deleteResult.rows.length === 0) {
        throw new Error('Menu item not found');
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
  static async getCategories() {
    const result = await db.query(
      `SELECT 
         category,
         COUNT(*) as item_count,
         AVG(price) as avg_price
       FROM menu_items 
       WHERE is_available = true
       GROUP BY category 
       ORDER BY category`
    );

    return result.rows;
  }

  //--
  static async checkAvailability(id, quantity = 1) {
    const result = await db.query(
      `SELECT 
         m.id,
         m.name,
         m.is_available,
         CASE 
           WHEN EXISTS (
             SELECT 1 
             FROM menu_ingredients mi 
             JOIN inventory inv ON mi.inventory_item_id = inv.id 
             WHERE mi.menu_item_id = m.id 
               AND inv.current_stock < (mi.quantity * $2)
           ) THEN false
           ELSE true
         END as has_sufficient_stock
       FROM menu_items m
       WHERE m.id = $1`,
      [id, quantity]
    );

    if (result.rows.length === 0) {
      throw new Error('Menu item not found');
    }

    const item = result.rows[0];
    return {
      ...item,
      is_available_for_order: item.is_available && item.has_sufficient_stock
    };
  }

  //--
  static async search(query, category = null) {
    let searchQuery = `
      SELECT m.*, 
             json_agg(json_build_object(
               'ingredient_id', mi.inventory_item_id,
               'ingredient_name', inv.name,
               'quantity', mi.quantity,
               'unit', inv.unit
             )) as ingredients
      FROM menu_items m
      LEFT JOIN menu_ingredients mi ON m.id = mi.menu_item_id
      LEFT JOIN inventory inv ON mi.inventory_item_id = inv.id
      WHERE (m.name ILIKE $1 OR m.description ILIKE $1 OR m.category ILIKE $1)
        AND m.is_available = true
    `;

    const params = [`%${query}%`];
    let paramCount = 1;

    if (category) {
      paramCount++;
      searchQuery += ` AND m.category = $${paramCount}`;
      params.push(category);
    }

    searchQuery += ` GROUP BY m.id ORDER BY m.category, m.name`;

    const result = await db.query(searchQuery, params);
    return result.rows;
  }

  //--
  static async checkMultipleAvailability(items) {
    const availabilityResults = [];

    for (const item of items) {
      const { menu_item_id, quantity = 1 } = item;

      try {
        const menuItem = await this.findById(menu_item_id);
        
        if (!menuItem) {
          availabilityResults.push({
            menu_item_id,
            available: false,
            reason: 'Menu item not found'
          });
          continue;
        }

        if (!menuItem.is_available) {
          availabilityResults.push({
            menu_item_id,
            available: false,
            reason: 'Menu item is not available'
          });
          continue;
        }

        const stockCheck = await db.query(
          `SELECT 
             mi.inventory_item_id,
             inv.name as ingredient_name,
             inv.current_stock,
             mi.quantity as required_per_unit,
             (mi.quantity * $2) as total_required,
             CASE 
               WHEN inv.current_stock >= (mi.quantity * $2) THEN true
               ELSE false
             END as has_sufficient_stock
           FROM menu_ingredients mi
           JOIN inventory inv ON mi.inventory_item_id = inv.id
           WHERE mi.menu_item_id = $1`,
          [menu_item_id, quantity]
        );

        const insufficientIngredients = stockCheck.rows.filter(ing => !ing.has_sufficient_stock);

        if (insufficientIngredients.length > 0) {
          availabilityResults.push({
            menu_item_id,
            available: false,
            reason: 'Insufficient ingredients',
            insufficient_ingredients: insufficientIngredients.map(ing => ({
              ingredient_id: ing.inventory_item_id,
              ingredient_name: ing.ingredient_name,
              current_stock: ing.current_stock,
              required: ing.total_required
            }))
          });
        } else {
          availabilityResults.push({
            menu_item_id,
            available: true,
            name: menuItem.name
          });
        }
      } catch (error) {
        availabilityResults.push({
          menu_item_id,
          available: false,
          reason: error.message
        });
      }
    }

    return availabilityResults;
  }

  //--
  static async getIngredientsStats() {
    const result = await db.query(`
      SELECT 
        inv.id,
        inv.name,
        inv.category as ingredient_category,
        COUNT(mi.menu_item_id) as used_in_menu_items,
        SUM(mi.quantity) as total_required_per_unit,
        inv.current_stock,
        inv.minimum_stock,
        inv.is_low_stock
      FROM inventory inv
      LEFT JOIN menu_ingredients mi ON inv.id = mi.inventory_item_id
      GROUP BY inv.id, inv.name, inv.category, inv.current_stock, inv.minimum_stock, inv.is_low_stock
      ORDER BY used_in_menu_items DESC, inv.name
    `);

    return result.rows;
  }
}

module.exports = MenuItem;