const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');

const Blog = require('../models/blog');

/*
app.get('/',(req,res)=>{
    res.render('home',{
        titulo:'okokok',
        parrafo:' loremp ipsum'
    });
})*/

app.get('/blog', verificarToken, (req,res)=>{

    let desde = req.query.desde  || 0;
    desde = Number(desde);

    let limite = req.query.limite  || 0;
    limite = Number(limite)

    Blog.find({estado:true},'nombre email role')
    .skip(desde)
    .limit(limite)
    .exec( (err,blogs)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        Blog.count({nombre:"pedro"},(err,conteo) =>{
            res.json({
                ok:true,
                total:conteo,
                blogs
            })
        })


    })
})

app.post('/blog' ,  (req,res) => {
    
    let parametro = req.body;

    let blog  = new Blog({
        title:parametro.title,
        subtitle:parametro.subtitle,
        body:parametro.body,
        metadescription:parametro.metadescription,
        gallery:parametro.gallery,
        owner:parametro.owner,
        date:parametro.date,
        time:parametro.time,
        active:true,
        campaignId:parametro.campaignId,
        userId:parametro.userId,
        avatar:parametro.avatar
    })

    Blog.save(( err,blogDB ) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

       // blogDB.password = null
        
        res.json({
            ok:true,
            blog: blogDB
        })

    })
    
})

app.put('/blog/:id', verificarToken, (req,res) => {

    let id = req.params.id;
    let body =  _.pick(req.body,['name']);

    Blog.findByIdAndUpdate(id, body,{ new:true },(err,blogDB) =>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            blog : blogDB
        })

    })

})

app.delete('/blogAdmin/:id',[verificarToken,isAdmin], (req,res) => {
    let id = req.params.id;

    Blog.findByIdAndDelete(id,(err,blogBorrado) => {

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }


        if(!blogBorrado) {
            res.status(400).json({
                ok:false,
                err,
                message:'blog no encontrado'
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

app.delete('/blog/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Blog.findByIdAndUpdate(id, cambiaEstado, { new:true }, (err, blogDB) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

        res.json({
            ok:true,
            message:'El blog  fue desactivado',
            data:id
        })
    })
})

module.exports = app;