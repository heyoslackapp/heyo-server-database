const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');

const Agency = require('../models/agency');

/*
app.get('/',(req,res)=>{
    res.render('home',{
        titulo:'okokok',
        parrafo:' loremp ipsum'
    });
})*/

app.get('/agency', verificarToken, (req,res)=>{

    
    let desde = req.query.desde  || 0;
    desde = Number(desde);


    let limite = req.query.limite  || 0;
    limite = Number(limite)



    Agency.find({estado:true},'nombre email role')
    .skip(desde)
    .limit(limite)
    .exec( (err,agencys)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        Agency.count({nombre:"pedro"},(err,conteo) =>{
            res.json({
                ok:true,
                total:conteo,
                agencys
            })
        })


    })
})

app.post('/agency' ,  (req,res) => {
    
    let parametro = req.body;

    console.log(parametro)

    
    let agency  = new Agency({
        name:parametro.name,
        email:parametro.email,
        phone:parametro.phone,
        address:parametro.address,
        documentid:parametro.documentid,
        typedocumentid:parametro.typedocumentid,
        description:parametro.description,
        gallery:parametro.gallery,
        socialNetwork:parametro.socialNetwork,
        owner:parametro.owner,
        active:true,
        map:parametro.map,
        userId:parametro.userId
    })

    agency.save(( err,agencyDB ) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

       // agencyDB.password = null
        
        res.json({
            ok:true,
            agency: agencyDB
        })

    })
    
})

app.put('/agency/:id', verificarToken, (req,res) => {

    let id = req.params.id;
    let body =  _.pick(req.body,['nombre']);
    console.log(body);

    Agency.findByIdAndUpdate(id, body,{ new:true },(err,agencyDB) =>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            agency : agencyDB
        })

    })

})

app.delete('/agencyAdmin/:id',[verificarToken,isAdmin], (req,res) => {
    let id = req.params.id;

    agency.findByIdAndDelete(id,(err,agencyBorrado) => {

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }


        if(!agencyBorrado) {
            res.status(400).json({
                ok:false,
                err,
                message:'agency no encontrado'
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

app.delete('/agency/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    agency.findByIdAndUpdate(id, cambiaEstado, { new:true }, (err, agencyDB) =>{

        if( err ) {
            res.status(400).json({
                ok:false,
                err,
                message:' Falla en los parametros'
            })
        }

        res.json({
            ok:true,
            message:'El agency  fue desactivado',
            data:id
        })
    })
})

module.exports = app;