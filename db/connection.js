const { Pool } = require('pg');
const ENV = process.env.NODE_ENV || 'development';
console.log('ENV', ENV);
require('dotenv').config({
  path: `${__dirname}/../.env.${ENV}`,
});

console.log('process.env.DATABASE', process.env.PGDATABASE);

console.log('process.env.PASSWORD', process.env.PGPASSWORD);
if (!process.env.PGDATABASE) {
  throw new Error('PGDATABASE not set');
}

module.exports = new Pool();