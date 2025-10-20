const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET /api/menu 
router.get('/', menuController.getMenuItems);

// GET /api/menu/categories 
router.get('/categories', menuController.getMenuCategories);

// GET /api/menu/:id 
router.get('/:id', menuController.getMenuItem);

// GET /api/menu/:id/availability 
router.get('/:id/availability', menuController.checkMenuItemAvailability);

// GET /api/menu/category/:category
router.get('/category/:category', menuController.getMenuItemsByCategory);

// GET /api/menu/search/:query
router.get('/search/:query', menuController.searchMenuItems);

// POST /api/menu 
router.post('/', menuController.createMenuItem);

// PUT /api/menu/:id
router.put('/:id', menuController.updateMenuItem);

// PATCH /api/menu/:id 
router.patch('/:id', menuController.partialUpdateMenuItem);

// DELETE /api/menu/:id 
router.delete('/:id', menuController.deleteMenuItem);

// POST /api/menu/available/check 
router.post('/available/check', menuController.checkMenuItemsAvailability);

// GET /api/menu/stats/ingredients
router.get('/stats/ingredients', menuController.getIngredientsStats);

module.exports = router;