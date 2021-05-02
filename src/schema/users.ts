import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
    },
    prevTime: {
        type: String,
        required: false,
    },
    currentTime: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
});

export default mongoose.model('users', userSchema);
