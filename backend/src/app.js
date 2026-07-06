const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const donors = require('./routes/donors');
const hospitals = require('./routes/hospitals');
const inventory = require('./routes/inventory');
const requests = require('./routes/requests');
const donations = require('./routes/donations');
const analytics = require('./routes/analytics');
const alerts = require('./routes/alerts');
const compatibility = require('./routes/compatibility');
const search = require('./routes/search');
const exportRoutes = require('./routes/export');
const settings = require('./routes/settings');
const outreach = require('./routes/outreach');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());
app.use(morgan(isProd ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'blood-banking-api',
    version: '0.4.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/donors', donors);
app.use('/api/hospitals', hospitals);
app.use('/api/inventory', inventory);
app.use('/api/requests', requests);
app.use('/api/donations', donations);
app.use('/api/analytics', analytics);
app.use('/api/alerts', alerts);
app.use('/api/compatibility', compatibility);
app.use('/api/search', search);
app.use('/api/export', exportRoutes);
app.use('/api/settings', settings);
app.use('/api/outreach', outreach);

// Serve built React app in production (single-server deploy)
if (isProd) {
  const distPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);

module.exports = app;