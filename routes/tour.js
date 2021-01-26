const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');

const Tour = require('../models/tour');

/*
app.get('/',(req,res)=>{
    res.render('home',{
        titulo:'okokok',
        parrafo:' loremp ipsum'
    });
})*/

app.get('/tour', verificarToken, (req,res)=>{

    
    let desde = req.query.desde  || 0;
    desde = Number(desde);


    let limite = req.query.limite  || 0;
    limite = Number(limite)



    Tour.find({active:true},'nombre email role')
    .skip(desde)
    .limit(limite)
    .exec( (err,tours)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        Tour.count({nombre:"pedro"},(err,conteo) =>{
            res.json({
                ok:true,
                total:conteo,
                tours
            })
        })


    })
})

app.post('/tour' ,  (req,res) => {
    
    let parametro = req.body;

    console.log(parametro)

    let tour  = new Tour({
        name:parametro.name,
        email:parametro.email,
        phone:parametro.phone,
        address:parametro.address,
        description:parametro.description,
        gallery:parametro.gallery,
        owner:parametro.owner,
        date:parametro.date,
        time:parametro.time,
        active:true,
        map:parametro.map,
        free:parametro.free,
        userId:parametro.userId,
        tags:parametro.tags,
        price:parametro.price,
        max:parametro.max,
        min:parametro.min,
        days:parametro.days,
        schedule:parametro.schedule,
        categoryId:parametro.categoryId,
        body:parametro.body,
        email:parametro.email,
        phone:parametro.phone
    })

    Tour.save(( err,tourDB ) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

       // tourDB.password = null
        
        res.json({
            ok:true,
            tour: tourDB
        })

    })
    
})

app.put('/tour/:id', verificarToken, (req,res) => {

    let id = req.params.id;
    let body =  _.pick(req.body,['name']);
    console.log(body);

    Tour.findByIdAndUpdate(id, body,{ new:true },(err,tourDB) =>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            tour : tourDB
        })

    })

})

app.delete('/tourAdmin/:id',[verificarToken,isAdmin], (req,res) => {
    let id = req.params.id;

    Tour.findByIdAndDelete(id,(err,tourBorrado) => {

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }


        if(!tourBorrado) {
            res.status(400).json({
                ok:false,
                err,
                message:'tour no encontrado'
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

app.delete('/tour/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Tour.findByIdAndUpdate(id, cambiaEstado, { new:true }, (err, tourDB) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

        res.json({
            ok:true,
            message:'El tour  fue desactivado',
            data:id
        })
    })
})

module.exports = app;