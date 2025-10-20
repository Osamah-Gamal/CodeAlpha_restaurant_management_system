const MenuItem = require('../models/MenuItem');

//-- get menu items...
exports.getMenuItems = async (req, res) => {
  try {
    const { category, available } = req.query;
    const filters = { category, available };
    
    const menuItems = await MenuItem.findAll(filters);
    
    res.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//-- get menu item...
exports.getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//-- create menu item..
exports.createMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//-- update menu item...
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.update(id, req.body);

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
  } catch (error) {
    if (error.message === 'Menu item not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//-- partial update menu item...
exports.partialUpdateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.partialUpdate(id, req.body);

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
  } catch (error) {
    if (error.message === 'Menu item not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//-- delete menu item...
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.delete(id);

    res.json({
      success: true,
      message: 'Menu item deleted successfully',
      data: menuItem
    });
  } catch (error) {
    if (error.message === 'Menu item not found') {
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

//-- get menu mategories...
exports.getMenuCategories = async (req, res) => {
  try {
    const categories = await MenuItem.getCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//-- check menu item availability...
exports.checkMenuItemAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.query;

    const availability = await MenuItem.checkAvailability(id, parseInt(quantity));

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    if (error.message === 'Menu item not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// get menu items by category...
exports.getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { available } = req.query;

    const filters = { category, available: available === 'true' };
    const menuItems = await MenuItem.findAll(filters);

    res.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// search menu items...
exports.searchMenuItems = async (req, res) => {
  try {
    const { query } = req.params;
    const { category } = req.query;

    const menuItems = await MenuItem.search(query, category);

    res.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// check menu items availability..
exports.checkMenuItemsAvailability = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required'
      });
    }

    const availabilityResults = await MenuItem.checkMultipleAvailability(items);

    const allAvailable = availabilityResults.every(result => result.available);

    res.json({
      success: true,
      all_available: allAvailable,
      results: availabilityResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// get ingredients stats..
exports.getIngredientsStats = async (req, res) => {
  try {
    const stats = await MenuItem.getIngredientsStats();

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