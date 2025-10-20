const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT =  5000;

// Middleware...
app.use(cors());
app.use(express.json());

// Routes....
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/reports', require('./routes/reports'));

// basic route..
app.get('/', (req, res) => {
  res.json({ 
    message: 'Restaurant Management System API',
    version: '1.0.0'
  });
});

// Health check....
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
});