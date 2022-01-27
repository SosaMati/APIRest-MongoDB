const express = require('express');
const Curso = require('../models/curso_model');
const verificaToken = require('../middlewares/auth');
const ruta = express.Router();


//metodo GET crear la ruta raiz
ruta.get('/', verificaToken, (req, res) => {

    let resultado = listarCursosActivos();
    resultado.then(cursos => {
        res.json(cursos)
    }).catch(err => {
        res.status(400).json(err)
    })
});

//metodo POST
ruta.post('/', verificaToken, (req, res) => {
    let resultado = crearCurso(req);

    resultado.then(curso => {
        res.json({
            curso
        })
    }).catch(err => {
        res.status(400).json({
            err
        })
    })
});

//metodo PUT
ruta.put('/:id', verificaToken, (req, res) => {
    let resultado = actualizarCurso(req.params.id, req.body);
    resultado.then(curso => {
        res.json(curso);
    }).catch(err =>{
        res.status(400).json(err);
    })
});


//metodo DELETE, cambio de estado
ruta.delete('/:id', verificaToken,  (req, res) => {
    let resultado = desactivarCurso(req.params.id);
    resultado.then(curso => {
        res.json(curso);
    }).catch(err => {
        res.status(400).json(err);
    })
});


//metodos
//función asincrona devuelve una promesa, nos permite guardar la información del curso
async function crearCurso(req){
    let curso = new Curso({
        titulo      : req.body.titulo,
        autor       : req.usuario._id,
        descripcion : req.body.desc
    });
    return await curso.save();
}

//función que nos permite actualizar el curso
async function actualizarCurso(id, body){
    let curso = await Curso.findByIdAndUpdate(id, {
        $set: {
            titulo: body.titulo,
            descripcion: body.desc
        } 
    }, {new: true});
    return curso;
}

//función asincrona que nos permite cambiar el estado del documento a desactivado
async function desactivarCurso(id){
    let curso = await Curso.findByIdAndUpdate(id, {
        $set: {
            estado: false
        }
    }, {new: true});
    return curso;
}

//función asincrona que nos permite listar cursos activos
async function listarCursosActivos(){
    let cursos = await Curso
        .find({"estado": true})
        .populate('autor', 'nombre -_id'); //muestra el nombre del autor
    return cursos;
}

//exportar el modulo ruta
module.exports = ruta; 