import carParkingHelper from '../carParkingHelper';

const {
    updateParkingValue,
} = carParkingHelper;

describe('carParkingHelper', () => {
    const parkings = [
        {
            slotNumber: 1,
            carNumber: 'MH1',
        },
        {
            slotNumber: 2,
            carNumber: 'MH2',
        },
        {
            slotNumber: 3,
            carNumber: 'MH3',
        },
    ];

    it('Check if data is updated and returned correctly', () => {
        const response = updateParkingValue(parkings, 1, 'MH5');

        expect(response).toHaveLength(3);
        expect(response[1]).toHaveProperty('carNumber', 'MH5');
        expect(response[1]).toHaveProperty('slotNumber', 2);
    });

    it('Check if empty array is returned for no data', () => {
        const response = updateParkingValue([], 1, 'MH5');

        expect(response).toEqual([]);
    });
});
