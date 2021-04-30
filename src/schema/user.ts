import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
    },
    prevTime: {
        type: Number,
        required: false,
    },
    currentTime: {
        type: Number,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
});

export default mongoose.model('user', userSchema);
