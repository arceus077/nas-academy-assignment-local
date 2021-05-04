const updateParkingValue = (parkings: Array<{ slotNumber: number; carNumber: String; }>, index: number, carnumber: String):
    Array<{ slotNumber: number; carNumber: String; }> => {

    if(parkings?.length > 0) {
        const newParkings = [...parkings];
        const response = newParkings[index];
        newParkings[index] = { ...response, carNumber: carnumber };

        return newParkings;
    }
    return [];
}

export default { updateParkingValue };
