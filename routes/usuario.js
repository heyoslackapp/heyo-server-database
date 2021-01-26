const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');

const Usuario = require('../models/usuario');

app.get('/usuariox',  (req,res)=>{
    const conferenceId = '5f8913f32dafe77b92dcf4ee'
    Usuario.find({conferenceId}).exec( (err,usuarios)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        Usuario.countDocuments({conferenceId},(err,conteo) =>{
            res.json({
                ok:true,
                total:conteo,
                usuarios
            })
        })
    })
})
 
app.post('/usuario' ,  (req,res) => {
    
    let parametro = req.body;

    let usuario  = new Usuario({
        nombre:parametro.nombre,
        email:parametro.email,
        password:bcrypt.hashSync(parametro.password,10),
        img:parametro.img,
        role:parametro.role,
        domain:parametro.domain,
        conferenceId:parametro.conferenceId,
        description:parametro.description,
        status:false,
        invitation:false,
        date:moment.now()
    })

    usuario.save(( err,usuarioDB ) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

       // usuarioDB.password = null
        
        res.json({
            ok:true,
            usuario: usuarioDB
        })

    })
    
})

app.post('/usuario' ,  (req,res) => {
    

    let parametro = req.body;

    let usuario  = new Usuario({
        nombre:parametro.nombre,
        email:parametro.email,
        password:bcrypt.hashSync('45678',10),
        role:"USER",
        domain:"dalive.com"
    })

    usuario.save(( err,usuarioDB ) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

       // usuarioDB.password = null
        
        res.json({
            ok:true,
            usuario: usuarioDB
        })

    })
    
})

app.put('/usuario/:id', verificarToken, (req,res) => {

    let id = req.params.id;
    let body =  _.pick(req.body,['nombre']);
    console.log(body);

    Usuario.findByIdAndUpdate(id, body,{ new:true },(err,usuarioDB) =>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            usuario : usuarioDB
        })

    })

})

app.delete('/usuarioAdmin/:id',[verificarToken,isAdmin], (req,res) => {
    let id = req.params.id;

    Usuario.findByIdAndDelete(id,(err,usuarioBorrado) => {

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }


        if(!usuarioBorrado) {
            res.status(400).json({
                ok:false,
                err,
                message:'Usuario no encontrado'
            })
        }

        res.json({
            data:id
        })
    })
})

let cambiaEstado  = {
    estado:false
}
app.delete('/usuario/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new:true }, (err, usuarioDB) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

        res.json({
            ok:true,
            message:'El usuario  fue desactivado',
            data:id
        })
    })
});

module.exports = app;