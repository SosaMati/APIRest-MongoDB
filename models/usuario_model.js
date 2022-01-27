const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true //para que el mail sea unico y no se repitan los usuarios
    },
    nombre: { 
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    estado: {
        type: Boolean,
        default: true
    },
    imagen: {
        type: String,
        required: false
    }
});

//exportamos el modelo usuario
module.exports = mongoose.model('Usuario', usuarioSchema);
