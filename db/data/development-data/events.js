const generalEventsData = [
    {
        type: 'bull',
        start_time: new Date('2024-01-01T00:00:00Z'),
        end_time: new Date('2024-01-01T15:00:00Z'),
        details: { description: 'Market bullish trend' }
    },
    {
        type: 'bear',
        start_time: new Date('2024-01-02T00:00:00Z'),
        end_time: new Date('2024-01-02T15:00:00Z'),
        details: { description: 'Market bearish trend' }
    }
    // ... other general event entries ...
];

const coinEventsData = [
    {
        coin_id: 1, // assuming coin with ID 1 exists
        type: 'boom',
        start_time: new Date('2024-01-01T10:00:00Z'),
        end_time: new Date('2024-01-01T13:00:00Z'),
        details: { description: 'Coin specific boom event' }
    },
    {
        coin_id: 2, // assuming coin with ID 2 exists
        type: 'bust',
        start_time: new Date('2024-01-02T11:00:00Z'),
        end_time: new Date('2024-01-02T14:00:00Z'),
        details: { description: 'Coin specific bust event' }
    }
    // ... other coin event entries ...
];
module.exports = { generalEventsData, coinEventsData };