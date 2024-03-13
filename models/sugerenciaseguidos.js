import mongoose from "mongoose";

const sugerenciaseguidos = mongoose.Schema({
    userId:{
        type: Number,
        required: true,
        default: 0
    },
    sugerenciaId:{
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

export const sugerenciaseguidosSchema = mongoose.model('sugerenciaseguidos', sugerenciaseguidos);