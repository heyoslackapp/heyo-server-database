const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');

const Suscription = require('../models/suscription');

/*
app.get('/',(req,res)=>{
    res.render('home',{
        titulo:'okokok',
        parrafo:' loremp ipsum'
    });
})*/

app.get('/suscription', verificarToken, (req,res)=>{

    
    let desde = req.query.desde  || 0;
    desde = Number(desde);


    let limite = req.query.limite  || 0;
    limite = Number(limite)



    Suscription.find({estado:true},'nombre email role')
    .skip(desde)
    .limit(limite)
    .exec( (err,suscriptions)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        Suscription.count({nombre:"pedro"},(err,conteo) =>{
            res.json({
                ok:true,
                total:conteo,
                suscriptions
            })
        })


    })
})

app.post('/suscription' ,  (req,res) => {
    
    let parametro = req.body;

    let suscription  = new Suscription({
        name:parametro.name,
        email:parametro.email,
        phone:parametro.phone,
        address:parametro.address,
        description:parametro.description,
        gallery:parametro.gallery,
        socialNetwork:parametro.socialNetwork,
        owner:parametro.owner,
        date:parametro.date,
        time:parametro.time,
        active:false,
        map:parametro.map,
        price:parametro.price,
        planId:parametro.planId,
        userId:parametro.userId
    })

    Suscription.save(( err,suscriptionDB ) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

       // suscriptionDB.password = null
        
        res.json({
            ok:true,
            suscription: suscriptionDB
        })

    })
    
})

app.put('/suscription/:id', verificarToken, (req,res) => {

    let id = req.params.id;
    let body =  _.pick(req.body,['nombre']);

    Suscription.findByIdAndUpdate(id, body,{ new:true },(err,suscriptionDB) =>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            suscription : suscriptionDB
        })

    })

})

app.delete('/suscriptionAdmin/:id',[verificarToken,isAdmin], (req,res) => {
    let id = req.params.id;

    Suscription.findByIdAndDelete(id,(err,suscriptionBorrado) => {

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }


        if(!suscriptionBorrado) {
            res.status(400).json({
                ok:false,
                err,
                message:'suscription no encontrado'
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

app.delete('/suscription/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Suscription.findByIdAndUpdate(id, cambiaEstado, { new:true }, (err, suscriptionDB) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

        res.json({
            ok:true,
            message:'El suscription  fue desactivado',
            data:id
        })
    })
})

module.exports = app;