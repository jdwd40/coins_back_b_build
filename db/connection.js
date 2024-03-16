const { Pool } = require('pg');
const ENV = process.env.NODE_ENV || 'development';
console.log('ENV', ENV);
console.log('process.env.DATABASE_URL', process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: "//jd:K1ller1921@db:5432/coins",
});

require('dotenv').config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE) {
  throw new Error('PGDATABASE not set');
}

module.exports = new Pool();