import mongoose from "mongoose";

const users = mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
        default: '',
    },
    country: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        required: true
    },
    wylexId: {
        type: Number,
        default: 0,
    },
});

export const usersSchema = mongoose.model('users', users);