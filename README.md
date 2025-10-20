# CodeAlpha_restaurant_management_system
TASK 2: Event Registration System 
● Set up backend using Django or Express.js to manage routes and logic.
● Create models for events and user registrations in your database (like PostgreSQL, MongoDB etc.).
● Build API endpoints to view event list, event details, and submit registration forms.
● Link registrations to users and events, and allow users to manage (view/cancel) their registrations.
● Optional: Add admin panel or authentication for event organizers.


# APIs 
Base URL=> http://localhost:5000/api

# Before starting with the API, these are the types of Status...
## 🔄 Status Values
# Order Status: pending, preparing, completed, cancelled
# Table Status: available, occupied, reserved
# Reservation Status: confirmed, cancelled


## 📋 Menu Routes
Get All Menu Items
Route: `GET /api/menu`
Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "price": 45.00,
      "category": "Pizza",
      "is_available": true
    }
  ]
}

Get Single Menu Item
Route: GET /api/menu/:id

Response:

json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Margherita Pizza",
    "price": 45.00,
    "description": "Classic pizza with mozzarella and tomatoes"
  }
}

Create Menu Item
Route: POST /api/menu
Request:
json
{
  "name": "Caesar Salad",
  "price": 25.00,
  "category": "Salads",
  "is_available": true
}

Response:
json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "id": 3,
    "name": "Caesar Salad",
    "price": 25.00
  }
}

## 📦 Order Routes
Create Order
Route: POST /api/orders
Request:
json
{
  "table_id": 1,
  "customer_name": "Osamah Gamal",
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "price": 45.00
    }
  ],
  "total_amount": 90.00
}

Response:
json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "status": "pending",
    "total_amount": 90.00
  }
}

Get All Orders
Route: GET /api/orders
Response:
json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_name": "Osamah Gamal",
      "total_amount": 90.00,
      "status": "pending"
    }
  ]
}

Get Order Details
Route: GET /api/orders/:id
Response:
json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_name": "Osamah Gamal",
    "status": "pending",
    "items": [
      {
        "menu_item_name": "Margherita Pizza",
        "quantity": 2,
        "price": 45.00
      }
    ]
  }
}

Update Order Status
Route: PUT /api/orders/:id/status
Request:
json
{
  "status": "completed"
}

Response:
json
{
  "success": true,
  "message": "Order status updated successfully"
}

## 🪑 Table Routes
Get All Tables
Route: GET /api/tables
Response:
json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "table_number": 1,
      "capacity": 4,
      "status": "available"
    }
  ]
}

Get Available Tables
Route: GET /api/tables/available
Response:
json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "table_number": 1,
      "capacity": 4,
      "status": "available"
    }
  ]
}

Update Table Status
Route: PUT /api/tables/:id/status
Request:
json
{
  "status": "occupied"
}

Response:
json
{
  "success": true,
  "message": "Table status updated successfully"
}

## 📅 Reservation Routes
Create Reservation
Route: POST /api/reservations
Request:
json
{
  "table_id": 1,
  "customer_name": "Sarah Ali",
  "reservation_date": "2023-10-20",
  "reservation_time": "19:00",
  "party_size": 4
}

Response:
json
{
  "success": true,
  "message": "Reservation created successfully",
  "data": {
    "id": 1,
    "customer_name": "Sarah Ali",
    "reservation_date": "2023-10-20",
    "status": "confirmed"
  }
}

Get All Reservations
Route: GET /api/reservations
Response:
json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_name": "Sarah Ali",
      "reservation_date": "2023-10-20",
      "party_size": 4
    }
  ]
}

## 📦 Inventory Routes
Get All Inventory
Route: GET /api/inventory
Response:
json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "item_name": "Beef",
      "current_stock": 50.0,
      "minimum_stock": 10.0
    }
  ]
}

Update Inventory Stock
Route: PUT /api/inventory/:id/stock
Request:
json
{
  "current_stock": 60.0
}

Response:
json
{
  "success": true,
  "message": "Stock updated successfully"
}

Get Low Stock Items
Route: GET /api/inventory/low-stock
Response:
json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "item_name": "Tomatoes",
      "current_stock": 5.0,
      "minimum_stock": 8.0
    }
  ]
}

## 📊 Report Routes
Daily Sales Report
Route: GET /api/reports/daily-sales/2023-10-15
Response:
json
{
  "success": true,
  "data": {
    "date": "2023-10-15",
    "total_orders": 15,
    "total_revenue": 2250.50
  }
}

Stock Alerts
Route: GET /api/reports/stock-alerts
Response:
json
{
  "success": true,
  "data": [
    {
      "item_name": "Tomatoes",
      "current_stock": 5.0,
      "minimum_stock": 8.0,
      "alert_level": "LOW"
    }
  ]
}

