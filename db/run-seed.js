const devData = require('./data/development-data/index.js');
const { seed } = require('./seed.js');
const db = require('./connection.js');

const runSeed = async () => {
  await seed(devData);
  return await db.end();
};

runSeed();

console.log('seeded');