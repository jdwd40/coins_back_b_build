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
        coin_id: 1,
        type: 'Technological Breakthrough',
        is_positive: true,
        impact: 'high',
        start_time: new Date('2024-03-22T09:00:00Z'),
        end_time: new Date('2024-03-22T09:15:00Z')
    },
    {
        coin_id: 2,
        type: 'Negative Media Coverage',
        is_positive: false,
        impact: 'low',
        start_time: new Date('2024-03-22T10:00:00Z'),
        end_time: new Date('2024-03-22T10:30:00Z')
    },
    // ... other coin event entries ...
];
module.exports = { generalEventsData, coinEventsData };