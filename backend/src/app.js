const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const donors = require('./routes/donors');
const hospitals = require('./routes/hospitals');
const inventory = require('./routes/inventory');
const requests = require('./routes/requests');
const donations = require('./routes/donations');
const analytics = require('./routes/analytics');
const errorHandler = require('./middleware/errorHandler');
const { apiAuth, corsOptions } = require('./middleware/security');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors(corsOptions()));
app.use(express.json({ limit: '64kb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'blood-banking-api' });
});

app.use('/api/donors', apiAuth, donors);
app.use('/api/hospitals', apiAuth, hospitals);
app.use('/api/inventory', apiAuth, inventory);
app.use('/api/requests', apiAuth, requests);
app.use('/api/donations', apiAuth, donations);
app.use('/api/analytics', apiAuth, analytics);

app.use(errorHandler);

module.exports = app;
