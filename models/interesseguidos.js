import mongoose from "mongoose";

const interesseguidos = mongoose.Schema({
    userId:{
        type: Number,
        required: true,
        default: 0
    },
    interesId:{
        type: Object,
        required: true,
        default: 0
    },
    meta_existe:{
        type: Boolean,
        required: true,
        default: true
    },
    data:[{}],
    created_at: {
        type: Date,
        default: Date.now
    }
});

export const interesseguidosSchema = mongoose.model('interesseguidos', interesseguidos);