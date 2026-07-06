const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }
    next();
  };
}

function validateBloodGroup(req, res, next) {
  const group = req.body.bloodGroup || req.params.bloodGroup;
  if (group && !BLOOD_GROUPS.includes(group)) {
    return res.status(400).json({ error: `Invalid blood group: ${group}` });
  }
  next();
}

module.exports = { requireFields, validateBloodGroup, BLOOD_GROUPS };