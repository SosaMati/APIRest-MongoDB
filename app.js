const usuarios = require('./routes/usuarios');
const cursos = require('./routes/cursos');
const auth = require('./routes/auth');
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');


//Conectandose a la DB
mongoose.connect(config.get('configDB.HOST'))
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.log('No se pudo conectar con MongoDB..', err));
mongoose.set('useCreateIndex', true);


const app = express();

//hacemos que exprees trabaje con datos Json
app.use(express.json());
//nos permite leer las url que recibimos
app.use(express.urlencoded({ extended:true})); 
//llamamos a nuetras rutas
app.use('/api/usuarios', usuarios);
app.use('/api/cursos', cursos);
app.use('/api/auth', auth);


//Conectandose al puerto
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log('Api Rest Full ok, y ejecutandose...');
})