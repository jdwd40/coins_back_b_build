// test-data/transactions.js

module.exports = [
    {
      transactionId: 1,
      userId: 1, // Assuming user 1 exists
      coinId: 1, // Assuming coin 1 exists
      type: 'buy',
      amount: 50.0,
      price: 200.0,
      timestamp: new Date('2024-01-01T00:00:00Z')
    },
    {
      transactionId: 2,
      userId: 1,
      coinId: 2, // Assuming coin 2 exists
      type: 'sell',
      amount: 30.0,
      price: 150.0,
      timestamp: new Date('2024-01-02T00:00:00Z')
    },
    {
      transactionId: 3,
      userId: 2, // Assuming user 2 exists
      coinId: 1,
      type: 'buy',
      amount: 20.0,
      price: 210.0,
      timestamp: new Date('2024-01-03T00:00:00Z')
    },
    // ... additional transactions
  ];
  