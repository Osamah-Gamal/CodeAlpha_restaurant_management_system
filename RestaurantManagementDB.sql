-- create database RestaurantManagementDB...
create database RestaurantManagementDB;

-- create tables ...
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    preparation_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    current_stock DECIMAL(10,2) NOT NULL,
    minimum_stock DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10,2),
    supplier VARCHAR(255),
    is_low_stock BOOLEAN DEFAULT FALSE,
    last_restocked TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_ingredients (
    id SERIAL PRIMARY KEY,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    inventory_item_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(50) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    table_id INTEGER REFERENCES tables(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    order_type VARCHAR(50) DEFAULT 'dine-in',
    customer_notes TEXT,
    prepared_at TIMESTAMP,
    served_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    table_id INTEGER REFERENCES tables(id),
    reservation_date TIMESTAMP NOT NULL,
    party_size INTEGER NOT NULL,
    duration INTEGER DEFAULT 120,
    status VARCHAR(50) DEFAULT 'confirmed',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--insert data for ex.
INSERT INTO tables (table_number, capacity, location) VALUES
('T01', 4, 'Main Hall'),
('T02', 4, 'Main Hall'),
('T03', 2, 'Window Side'),
('T04', 6, 'VIP Section'),
('T05', 8, 'VIP Section');

INSERT INTO inventory (name, category, current_stock, minimum_stock, unit, unit_price) VALUES
('Chicken Breast', 'Protein', 50.0, 10.0, 'kg', 25.00),
('Beef', 'Protein', 30.0, 5.0, 'kg', 40.00),
('Rice', 'Grains', 100.0, 20.0, 'kg', 8.00),
('Tomatoes', 'Vegetables', 20.0, 5.0, 'kg', 6.00),
('Lettuce', 'Vegetables', 15.0, 3.0, 'kg', 4.00);

INSERT INTO menu_items (name, description, price, category, preparation_time) VALUES
('Grilled Chicken', 'Juicy grilled chicken with herbs', 45.00, 'Main Course', 20),
('Beef Steak', 'Premium beef steak with sauce', 85.00, 'Main Course', 25),
('Caesar Salad', 'Fresh salad with caesar dressing', 35.00, 'Appetizer', 10),
('Mushroom Soup', 'Creamy mushroom soup', 25.00, 'Appetizer', 15);


