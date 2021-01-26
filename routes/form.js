const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');

const Form = require('../models/form');


app.get('/form', (req,res)=>{


    let desde = req.query.desde  || 0;
    desde = Number(desde);

    let limite = req.query.limite  || 0;
    limite = Number(limite)

    Form.find({})
    .skip(desde)
    .limit(limite)
    .exec( (err,forms)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        form.map( item => {

            if(item.cta){
                var json = JSON.stringify(eval("(" + item.cta + ")"));
                data2 = JSON.parse(json);
                console.log(data2[0]["apellido"]);
                console.log(data2[1]["apellido"]);
            }

        })

        Form.countDocuments((err,conteo) =>{
            res.json({
                ok:true,
                total:conteo,
                forms
            })
        })


    })
})

app.post('/form', (req,res) => {
    
    let parametro = req.body;

    let form  = new Form({
        type:parametro.type,
        campaign:parametro.campaign,
        fields:parametro.fields,
        emails:parametro.emails,
        estado:parametro.estado,
        server:parametro.server,
        user:parametro.user,
        key:parametro.key
    })

    event.save(( err,eventDB ) =>{

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
            event: formDB
        })

    })
    
})

app.put('/form/:id', verificarToken, (req,res) => {

    let id = req.params.id;
    let body =  _.pick(req.body,['code']);

    Form.findByIdAndUpdate(id, body,{ new:true },(err,formDB) =>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            form : formDB
        })

    })

})


let cambiaEstado  = {
    estado:false
}

app.delete('/form/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Content.findByIdAndUpdate(id, cambiaEstado, { new:true }, (err, formDB) =>{

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