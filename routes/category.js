const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');

const Category = require('../models/category');

/*
app.get('/',(req,res)=>{
    res.render('home',{
        titulo:'okokok',
        parrafo:' loremp ipsum'
    });
})*/

app.get('/category', verificarToken, (req,res)=>{

    
    let desde = req.query.desde  || 0;
    desde = Number(desde);


    let limite = req.query.limite  || 0;
    limite = Number(limite)



    Category.find({estado:true},'nombre email role')
    .skip(desde)
    .limit(limite)
    .exec( (err,categorys)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        Category.count({nombre:"pedro"},(err,conteo) =>{
            res.json({
                ok:true,
                total:conteo,
                categorys
            })
        })


    })
})

app.post('/category' ,  (req,res) => {
    
    let parametro = req.body;


    let category  = new Category({
        name:parametro.name,
        active:true,
        entity:parametro.entity,
        description:parametro.description,
        userId:parametro.userId
    })

    Category.save(( err,categoryDB ) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

       // categoryDB.password = null
        
        res.json({
            ok:true,
            category: categoryDB
        })

    })
    
})

app.put('/category/:id', verificarToken, (req,res) => {

    let id = req.params.id;
    let body =  _.pick(req.body,['name']);

    Category.findByIdAndUpdate(id, body,{ new:true },(err,categoryDB) =>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            category : categoryDB
        })

    })

})

app.delete('/categoryAdmin/:id',[verificarToken,isAdmin], (req,res) => {
    let id = req.params.id;

    Category.findByIdAndDelete(id,(err,categoryBorrado) => {

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }


        if(!categoryBorrado) {
            res.status(400).json({
                ok:false,
                err,
                message:'category no encontrado'
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

app.delete('/category/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Category.findByIdAndUpdate(id, cambiaEstado, { new:true }, (err, categoryDB) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

        res.json({
            ok:true,
            message:'El category  fue desactivado',
            data:id
        })
    })
})

module.exports = app;