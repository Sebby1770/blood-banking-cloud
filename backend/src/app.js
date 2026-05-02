const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const donors = require('./routes/donors');
const hospitals = require('./routes/hospitals');
const inventory = require('./routes/inventory');
const requests = require('./routes/requests');
const donations = require('./routes/donations');
const analytics = require('./routes/analytics');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'blood-banking-api' });
});

app.use('/api/donors', donors);
app.use('/api/hospitals', hospitals);
app.use('/api/inventory', inventory);
app.use('/api/requests', requests);
app.use('/api/donations', donations);
app.use('/api/analytics', analytics);

app.use(errorHandler);

module.exports = app;
