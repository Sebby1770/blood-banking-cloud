const express = require('express');

const router = express.Router();

const ENDPOINTS = [
  { method: 'GET', path: '/api/health', description: 'Health check and version' },
  { method: 'GET', path: '/api/donors', description: 'List donors (filter by bloodGroup, city)' },
  { method: 'POST', path: '/api/donors', description: 'Register a donor' },
  { method: 'POST', path: '/api/donors/import', description: 'Bulk import donors' },
  { method: 'GET', path: '/api/donors/:id/history', description: 'Donor profile with donation history' },
  { method: 'GET', path: '/api/requests/queue', description: 'Priority-sorted pending requests' },
  { method: 'POST', path: '/api/requests/:id/fulfill', description: 'Fulfill a request' },
  { method: 'GET', path: '/api/outreach', description: 'Eligible donors for low-stock groups' },
  { method: 'GET', path: '/api/campaigns', description: 'List blood drive campaigns' },
  { method: 'POST', path: '/api/campaigns', description: 'Schedule a blood drive' },
  { method: 'GET', path: '/api/analytics/summary', description: 'Dashboard KPIs' },
  { method: 'GET', path: '/api/analytics/forecast', description: 'Supply/demand forecast' },
  { method: 'GET', path: '/api/search?q=', description: 'Global search' },
  { method: 'GET', path: '/api/export/donors.csv', description: 'Export donors CSV' },
  { method: 'GET', path: '/api/settings', description: 'Get system settings' },
  { method: 'PATCH', path: '/api/settings', description: 'Update settings' },
];

router.get('/', (_req, res) => {
  res.json({
    name: 'Blood Banking Cloud API',
    version: '0.5.0',
    endpoints: ENDPOINTS,
  });
});

module.exports = router;