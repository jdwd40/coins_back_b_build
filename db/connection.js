const { Pool } = require('pg');
const ENV = process.env.NODE_ENV || 'development';
const dotenvPath = `${__dirname}/../.env.${ENV}`;
console.log('ENV', ENV);
console.log('Loading .env file from', dotenvPath);
require('dotenv').config({
  path: dotenvPath,
});

// console.log('PGDATABASE', process.env.PGDATABASE);
// console.log('PGUSER', process.env.PGUSER);
// console.log('PGPASSWORD', process.env.PGPASSWORD);
// console.log('PGHOST', process.env.PGHOST);
// console.log('PGPORT', process.env.PGPORT);

if (!process.env.PGDATABASE || !process.env.PGUSER || !process.env.PGPASSWORD) {
  throw new Error('Database configuration not set');
}

const pool = new Pool({
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
});

module.exports = pool;