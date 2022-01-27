const express = require('express');
const config = require('config');
//token de seguridad
const jwt = require('jsonwebtoken');
//para encriptar el password
const bcrypt = require('bcrypt');
//importamos el modelo usuario
const Usuario = require('../models/usuario_model');
//const Joi = require('@hapi/joi');
const ruta = express.Router();


ruta.post('/', (req, res) => {
    Usuario.findOne({email: req.body.email})
        .then(datos => {
            if(datos){
                const passwordValido = bcrypt.compareSync(req.body.password, datos.password);
                if(!passwordValido) return res.status(400).json({error: 'ok', msj:'Usuario o contraseña incorrecta.'})
                //token de seguridad
                const jwToken = jwt.sign({
                    usuario: {_id: datos._id, nombre: datos.nombre, email: datos.email}
                }, config.get('configToken.SEED'), {expiresIn: config.get('configToken.expiration') });
                //jwt.sign({_id: datos._id, nombre: datos.nombre, email: datos.email}, 'password')
                res.json({
                    usuario:{
                        _id: datos._id,
                        nombre: datos.nombre, 
                        email: datos.email
                    },
                    jwToken
                });
            }else{
                res.status(400).json({
                    error:'ok',
                    msj:'Usuario o contraseña incorrecta.'
                })
            }
        })
        .catch(err =>{
            res.status(400).json({
                error:'ok',
                msj:'Error en el servicio' + err
            });
        })
});




module.exports = ruta;