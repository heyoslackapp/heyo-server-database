const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');

const Gallery = require('../models/gallery');

/*
app.get('/',(req,res)=>{
    res.render('home',{
        titulo:'okokok',
        parrafo:' loremp ipsum'
    });
})*/

app.get('/gallery', verificarToken, (req,res)=>{

    
    let desde = req.query.desde  || 0;
    desde = Number(desde);


    let limite = req.query.limite  || 0;
    limite = Number(limite)



    Gallery.find({estado:true},'nombre email role')
    .skip(desde)
    .limit(limite)
    .exec( (err,gallerys)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        Gallery.count({nombre:"pedro"},(err,conteo) =>{
            res.json({
                ok:true,
                total:conteo,
                gallerys
            })
        })


    })
})

app.post('/gallery' ,  (req,res) => {
    
    let parametro = req.body;
    let gallery  = new Gallery({
        url:parametro.url,
        active:true,
        description:parametro.description,
        userId:parametro.userId
    })

    Gallery.save(( err,galleryDB ) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

       // galleryDB.password = null
        
        res.json({
            ok:true,
            gallery: galleryDB
        })

    })
    
})

app.put('/gallery/:id', verificarToken, (req,res) => {

    let id = req.params.id;
    let body =  _.pick(req.body,['url']);

    Gallery.findByIdAndUpdate(id, body,{ new:true },(err,galleryDB) =>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            gallery : galleryDB
        })

    })

})

app.delete('/galleryAdmin/:id',[verificarToken,isAdmin], (req,res) => {
    let id = req.params.id;

    Gallery.findByIdAndDelete(id,(err,galleryBorrado) => {

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }


        if(!galleryBorrado) {
            res.status(400).json({
                ok:false,
                err,
                message:'gallery no encontrado'
            })
        }

        res.json({
            data:id
        })
    })
})

let cambiaEstado  = {
    active:false
}

app.delete('/gallery/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Gallery.findByIdAndUpdate(id, cambiaEstado, { new:true }, (err, galleryDB) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

        res.json({
            ok:true,
            message:'El gallery  fue desactivado',
            data:id
        })
    })
})

module.exports = app;