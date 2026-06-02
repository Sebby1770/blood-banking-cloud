const crypto = require('crypto');

const BLOOD_GROUPS = new Set(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
const LOCAL_ORIGINS = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);

function parseCsv(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function corsOptions() {
  const configured = parseCsv(process.env.ALLOWED_ORIGINS);
  const allowed = new Set(configured.length ? configured : LOCAL_ORIGINS);

  return {
    allowedHeaders: ['Authorization', 'Content-Type', 'X-API-Key'],
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    origin(origin, callback) {
      if (!origin || allowed.has(origin)) return callback(null, true);
      return callback(new Error(`Origin not allowed: ${origin}`));
    },
  };
}

function timingSafeEqualText(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function apiAuth(req, res, next) {
  const token = process.env.API_AUTH_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ error: 'API authentication is not configured.' });
    }
    return next();
  }

  const presented = req.get('x-api-key') || req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!timingSafeEqualText(presented, token)) {
    return res.status(401).json({ error: 'Valid API credentials are required.' });
  }
  return next();
}

function pick(source, fields) {
  return fields.reduce((out, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      out[field] = source[field];
    }
    return out;
  }, {});
}

function requireBloodGroup(value) {
  if (!BLOOD_GROUPS.has(value)) {
    const error = new Error('A valid bloodGroup is required.');
    error.status = 400;
    throw error;
  }
}

function requirePositiveInteger(value, fieldName, { max = 100 } = {}) {
  if (!Number.isInteger(value) || value < 1 || value > max) {
    const error = new Error(`${fieldName} must be an integer between 1 and ${max}.`);
    error.status = 400;
    throw error;
  }
}

function requireIntegerDelta(value, { maxAbs = 100 } = {}) {
  if (!Number.isInteger(value) || Math.abs(value) > maxAbs) {
    const error = new Error(`delta must be an integer between -${maxAbs} and ${maxAbs}.`);
    error.status = 400;
    throw error;
  }
}

module.exports = {
  BLOOD_GROUPS,
  apiAuth,
  corsOptions,
  pick,
  requireBloodGroup,
  requireIntegerDelta,
  requirePositiveInteger,
};
