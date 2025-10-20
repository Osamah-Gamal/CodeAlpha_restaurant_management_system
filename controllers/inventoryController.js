const Inventory = require('../models/Inventory');


//--- get inventory...
exports.getInventory = async (req, res) => {
  try {
    const { lowStock, category } = req.query;
    const filters = { lowStock, category };
    
    const inventory = await Inventory.findAll(filters);
    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//-- update inventory...
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStock, minimumStock, unitPrice, name, category, unit, supplier } = req.body;

    const updateData = {
      currentStock,
      minimumStock,
      unitPrice,
      name,
      category,
      unit,
      supplier
    };

    const item = await Inventory.update(id, updateData);
    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item
    });
  } catch (error) {
    if (error.message === 'Inventory item not found') {
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

// get inventory item...
exports.getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//-- create inventory item...
exports.createInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

//--update inventory stock...
exports.updateInventoryStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChange } = req.body;

    const item = await Inventory.updateStock(id, parseFloat(quantityChange));
    res.json({
      success: true,
      message: 'Inventory stock updated successfully',
      data: item
    });
  } catch (error) {
    if (error.message === 'Inventory item not found') {
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

//-- delete inventory item...
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.delete(id);
    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: item
    });
  } catch (error) {
    if (error.message === 'Inventory item not found') {
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

//-- get low stock alerts...
exports.getLowStockAlerts = async (req, res) => {
  try {
    const alerts = await Inventory.getLowStockAlerts();
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//--- get inventory categories....
exports.getInventoryCategories = async (req, res) => {
  try {
    const categories = await Inventory.getCategories();
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

//-- get inventory stats..
exports.getInventoryStats = async (req, res) => {
  try {
    const stats = await Inventory.getInventoryStats();
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