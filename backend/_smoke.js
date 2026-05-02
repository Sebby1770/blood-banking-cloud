// Smoke test: stubs out sqlite3, loads the Express app, and prints every
// wired-up route. Useful for verifying the API surface without spinning
// up a real database.
//
//   node _smoke.js

const Module = require('module');
const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'sqlite3') {
    return {
      Database: function () {},
      OPEN_READWRITE: 0, OPEN_CREATE: 0, OPEN_FULLMUTEX: 0,
      OPEN_URI: 0, OPEN_SHAREDCACHE: 0,
    };
  }
  return origLoad.call(this, req, ...rest);
};

const app = require('./src/app');
const routes = [];
app._router.stack.forEach((layer) => {
  if (layer.route) {
    routes.push(`${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
  }
  if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach((sub) => {
      if (sub.route) {
        const method = Object.keys(sub.route.methods)[0].toUpperCase();
        const prefix = layer.regexp.toString().match(/\^\\\/[^\\?]+/)?.[0].slice(2).replace(/\\\//g, '/') || '';
        routes.push(`${method} ${prefix}${sub.route.path}`);
      }
    });
  }
});
console.log('Mounted routes:');
routes.forEach((r) => console.log('  ' + r));
console.log(`\nTotal: ${routes.length} routes wired up cleanly.`);
