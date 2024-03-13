import mongoose from "mongoose";

const sugerencia = mongoose.Schema({
    description: {
        type: String,
        default:'',
        required: true,
    },
    title:{
        type: String,
        required: true,
        default: ""
    },
    picImg:{
        type: String,
        default: ""
    },
    estado:{
        type: Boolean,
        required: true,
        default: true
    },
    meta_existe:{
        type: Boolean,
        required: true,
        default: false
    },
    users_suscribed:{
        type: Number,
        required: true,
        default: 0
    },
    data:[{}],
    created_at: {
        type: Date,
        default: Date.now
    }
});

export const sugerenciaSchema = mongoose.model('sugerencia', sugerencia);