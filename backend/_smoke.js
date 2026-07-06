// Smoke test: verifies route files exist and v0.2.0 API surface is wired in app.js
// without loading Sequelize/SQLite (which can hang in CI sandboxes).
//
//   node _smoke.js

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'src');

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

const appSrc = read('app.js');

const ROUTE_MODULES = [
  'routes/donors.js',
  'routes/hospitals.js',
  'routes/inventory.js',
  'routes/requests.js',
  'routes/donations.js',
  'routes/analytics.js',
  'routes/alerts.js',
  'routes/compatibility.js',
  'routes/search.js',
  'routes/export.js',
  'routes/settings.js',
  'routes/outreach.js',
];

const REQUIRED_IN_APP = [
  '/api/alerts',
  '/api/compatibility',
  "version: '0.4.0'",
  '/api/settings',
  '/api/outreach',
  '/api/search',
  '/api/export',
];

const REQUIRED_ROUTE_PATTERNS = {
  'routes/alerts.js': ["router.get('/'", "router.post('/:id/read'", "router.post('/read-all'"],
  'routes/compatibility.js': ["router.get('/'", "router.get('/:bloodGroup'"],
  'routes/analytics.js': ["router.get('/activity'", "router.get('/fulfillment'"],
  'routes/requests.js': ["router.get('/queue'", "router.post('/:id/cancel'", "router.get('/:id/matches'"],
  'routes/donors.js': ["router.get('/:id/eligibility'"],
  'routes/donations.js': ['checkDonorEligibility'],
  'routes/search.js': ["router.get('/'"],
  'routes/export.js': ['donors.csv', 'inventory.csv'],
};

let failed = false;

for (const mod of ROUTE_MODULES) {
  const full = path.join(ROOT, mod);
  if (!fs.existsSync(full)) {
    console.error(`MISSING: ${mod}`);
    failed = true;
  }
}

for (const needle of REQUIRED_IN_APP) {
  if (!appSrc.includes(needle)) {
    console.error(`app.js missing: ${needle}`);
    failed = true;
  }
}

for (const [file, patterns] of Object.entries(REQUIRED_ROUTE_PATTERNS)) {
  const src = read(file);
  for (const pattern of patterns) {
    if (!src.includes(pattern)) {
      console.error(`${file} missing pattern: ${pattern}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error('\nSmoke test FAILED.');
  process.exit(1);
}

console.log('Smoke test passed.');
console.log(`  ${ROUTE_MODULES.length} route modules present`);
console.log('  v0.4.0 API surface verified (settings, outreach, queue, reports)');