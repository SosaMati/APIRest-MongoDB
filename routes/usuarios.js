const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
//para encriptar el password
const bcrypt = require('bcrypt');
//importamos el modelo usuario
const Usuario = require('../models/usuario_model');
const Joi = require('@hapi/joi');
const verificarToken = require('../middlewares/auth');
const ruta = express.Router();

//esquema de validación
const schema = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(30)
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
});




//metodo GET crear la ruta raiz, lista de usuarios activos
ruta.get('/', verificarToken, (req, res) => {
    let resultado = listarUsuariosActivos();
    resultado.then(usuarios => {
        res.json(usuarios);
    }).catch((err) => {
        res.status(400).json({
            err
        })
    })
});


//metodo POST, se trabaja la promesa  de la funcion crearUsuario 
ruta.post('/', (req, res) => {
    let body = req.body;

    //se verifica si el usuario ya existe 
    Usuario.findOne({email: body.email}, (err, user) => {
        if(err) {
            return res.status(400).json({error: 'Server error'})
        }
        if(user){
            //Usuario si existe 
            return res.status(400).json({
                msj: 'El usuario ya existe'
            });
        }else{
    
    
            //se valida la creación del usuario
            const {error, value} = schema.validate({nombre: body.nombre, email: body.email});
            if(!error){
                let resultado = crearUsuario(body);

                resultado.then( user => {
                    res.json({
                        nombre: user.nombre,
                        email: user.email
                    })
                }).catch( err => {
                    res.status(400).json({
                        err
                    })
                });
            }else{
                res.status(400).json({
                    error
                })
            }
        }    
    });    
});

//metodo PUT, actualización de datos
ruta.put('/:email', verificarToken, (req, res) => {
    //se valida la actualización del usuario
    const {error, value} = schema.validate({nombre: req.body.nombre});
    if(!error){
        let resultado = actualizarUsuario(req.params.email, req.body);
        resultado.then( valor => {
            res.json({
                nombre: valor.nombre,
                email : valor.email
            })       
        }).catch( err => {
            res.status(400).json({
                err
            })
        });
    }else{
        res.status(400).json({
            error
        })
    }
});

//cambio de estado de usuario
ruta.delete('/:email', verificarToken, (req, res) => {
    let resultado = desactivarUsuario(req.params.email);
    resultado.then( valor => {
        res.json({
            nombre: valor.nombre,
            email : valor.email
        })
    }).catch( err => {
        res.status(400).json({
            err
        })
    })
});
 


//metodos
//función asincrona devuelve una promesa, nos permite guardar la información del usuario
async function crearUsuario(body){
    let usuario = new Usuario({
        email    : body.email,
        nombre   : body.nombre,
        password : bcrypt.hashSync ( body.password, 10 ) //encriptar el password
    });
    return await usuario.save();
}

//función asincrona que nos permite actualizar datos de usuario
async function actualizarUsuario(email, body){
    let usuario = await Usuario.findOneAndUpdate({"email":email}, {
        $set: {
            nombre: body.nombre,
            password: body.password
        } 
    }, {new: true});
    return usuario;
}

//función asincrona que nos permite cambiar el estado del documento a desactivado
async function desactivarUsuario(email){
    let usuario = await Usuario.findOneAndUpdate({"email":email}, {
        $set: {
            estado: false
        }
    }, {new: true});
    return usuario;
}

//función asincrona que nos permite listar usuarios activos
async function listarUsuariosActivos(){
    let usuarios = await Usuario.find({"estado": true})
    .select({nombre:1, email:1});
    return usuarios;
}



//exportar la ruta
module.exports = ruta; 