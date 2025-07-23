// db.js
const { Pool } = require('pg');
const { patchPGPool } = require('./pg-filecommenter');

const pool = new Pool({
  // your pool config here, e.g.
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: 'mypassword',
  port: 5432,
});

// Patch the pool to add file path comments automatically
patchPGPool(pool);

module.exports = pool;
