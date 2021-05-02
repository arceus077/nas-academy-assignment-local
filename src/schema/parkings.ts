import mongoose from 'mongoose';

const parkingSchema = new mongoose.Schema({
    carNumber: {
        type: String,
        required: false,
    },
    slotNumber: {
        type: Number,
        required: true,
    },
});

export default mongoose.model('parkings', parkingSchema);
