
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'postgres', //---default...
    password: 'osamah777', //---pass
    host: 'localhost',
    port: 5432,
    database: 'RestaurantManagementDB' //---db 
});


// test connection....
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database...');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

//---
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};