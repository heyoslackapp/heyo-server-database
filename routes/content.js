const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');

const Content = require('../models/content');

app.get("/hola", (req, res) => {
    res.send({ response: "I am alive" }).status(200);
  });

app.get('/content', (req,res)=>{


    let desde = req.query.desde  || 0;
    desde = Number(desde);

    let limite = req.query.limite  || 0;
    limite = Number(limite)

    Content.find({})
    .skip(desde)
    .limit(limite)
    .exec( (err,contents)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        contents.map( item => {

            if(item.cta){
                var json = JSON.stringify(eval("(" + item.cta + ")"));
                data2 = JSON.parse(json);
                console.log(data2[0]["apellido"]);
                console.log(data2[1]["apellido"]);
            }

        })

        Content.countDocuments((err,conteo) =>{
            res.json({
                ok:true,
                total:conteo,
                contents
            })
        })


    })
})

app.post('/content', (req,res) => {
    
    let parametro = req.body;

    let content  = new Content({
        title:parametro.title,
        subtitle:parametro.subtitle,
        ctas:parametro.ctas,
        images:parametro.images,
        text:parametro.texto,
        type:parametro.type,
        campaign:parametro.campaign,
        code:parametro.code,
        name:parametro.name,
        description:parametro.description,
        user:parametro.user,
        estado:parametro.estado
    })

    content.save(( err,contentDB ) =>{

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
            content: contentDB
        })

    })
    
})

app.put('/content/:id', verificarToken, (req,res) => {

    let id = req.params.id;
    let body =  _.pick(req.body,['title']);

    Content.findByIdAndUpdate(id, body,{ new:true },(err,contentDB) =>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            content : contentDB
        })

    })

})


let cambiaEstado  = {
    estado:false
}

app.delete('/content/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Content.findByIdAndUpdate(id, cambiaEstado, { new:true }, (err, contentDB) =>{

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