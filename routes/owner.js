const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');

const Owner = require('../models/owner');

/*
app.get('/',(req,res)=>{
    res.render('home',{
        titulo:'okokok',
        parrafo:' loremp ipsum'
    });
})*/

app.get('/owner', verificarToken, (req,res)=>{

    
    let desde = req.query.desde  || 0;
    desde = Number(desde);


    let limite = req.query.limite  || 0;
    limite = Number(limite)



    Owner.find({active:true},'name email')
    .skip(desde)
    .limit(limite)
    .exec( (err,owners)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        Owner.count({active:"true"},(err,conteo) =>{
            res.json({
                ok:true,
                total:conteo,
                owners
            })
        })


    })
})

app.post('/owner' ,  (req,res) => {
    
    let parametro = req.body;

    let owner  = new Owner({
        name:parametro.name,
        email:parametro.email,
        phone:parametro.phone,
        address:parametro.address,
        documentid:parametro.documentid,
        typedocumentid:parametro.typedocumentid,
        description:parametro.description,
        socialNetwork:parametro.socialNetwork,
        active:true,
        avatar:parametro.avatar,
        userId:parametro.userId
    })

    owner.save(( err,ownerDB ) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

       // ownerDB.password = null
        
        res.json({
            ok:true,
            owner: ownerDB
        })

    })
    
})

app.put('/owner/:id', verificarToken, (req,res) => {

    let id = req.params.id;
    let body =  _.pick(req.body,['name']);
    console.log(body);

    Owner.findByIdAndUpdate(id, body,{ new:true },(err,ownerDB) =>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            owner : ownerDB
        })

    })

})

app.delete('/ownerAdmin/:id',[verificarToken,isAdmin], (req,res) => {
    let id = req.params.id;

    Owner.findByIdAndDelete(id,(err,ownerBorrado) => {

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }


        if(!ownerBorrado) {
            res.status(400).json({
                ok:false,
                err,
                message:'owner no encontrado'
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

app.delete('/owner/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Owner.findByIdAndUpdate(id, cambiaEstado, { new:true }, (err, ownerDB) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

        res.json({
            ok:true,
            message:'El owner  fue desactivado',
            data:id
        })
    })
})

module.exports = app;