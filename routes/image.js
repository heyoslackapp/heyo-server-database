const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');

const Image = require('../models/image');


app.get('/image',verificarToken, (req,res)=>{
    const conferenceId = req.usuario.conferenceId;
    Image.find({conferenceId}).exec( (err,result)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            result
        })
       
    })
})
 
app.delete('/image/:id', verificarToken, (req, res) => {
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
})

module.exports = app;