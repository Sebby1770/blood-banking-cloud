require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/db');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`[blood-bank] API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[blood-bank] Failed to start:', err);
    process.exit(1);
  }
})();
