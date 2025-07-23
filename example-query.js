// This is a sample usage file showing that when you run queries, the generated SQL includes the file path where the query was called.
const pool = require('./db');

async function run() {
  const res = await pool.query('SELECT NOW();');
  console.log(res.rows[0]);
}

run().catch(console.error).finally(() => process.exit());
