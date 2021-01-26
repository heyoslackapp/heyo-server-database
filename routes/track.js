const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
var Pushover = require('node-pushover');
var push = require( 'pushsafer-notifications' );
const Track = require('../models/track');

const { verificarToken } = require('../middlewares/autenticacion');

moment = require("moment");

var p = new push( {
    k: 't6kKVpbHRyfXfxDmQhzL',             // your 20 chars long private key 
    debug: true
});
  
var push = new Pushover({
	token: "a8duyzovv8pwvtgvahvq988fa27x8x",
	user: "ux4e437enahtcgtc557v2fj3zehvok"
});

app.get('/track', (req,res)=>{
    let desde = req.query.desde  || 0;
    desde = Number(desde);

    let limite = req.query.limite  || 0;
    limite = Number(limite)

    Track.find({},'cta type referer')
    .skip(desde)
    .limit(limite)
    .exec( (err,tracks)=>{
        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        Track.count({},(err,conteo) => {
            res.json({
                ok:true,
                total:conteo,
                tracks
            })
        })
    })
})

app.get('/trackByCTA/:code', (req,res)=>{
    let code = req.params.code;
    Track.find({code},'type cta campaign ip device')
    .exec( (err,tracks)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        Track.count({},(err,conteo) =>{
            res.json({
                ok:true,
                total:conteo,
                tracks
            })
        })
    })
})

app.get('/trackByCode', (req,res)=>{
   
    Track.aggregate(
        [
            { $match: { device:"mobil" } },
            { $group: { _id: '$code', total: { $sum:1}}}
        ],
    
        function(err, result) {
          if (err) {
            res.send(err);
          } else {
            res.json(result);
          }
        }
      );
})

app.get('/pageView/:client', (req,res)=>{
    let client = req.params.client;
    Track.find({client})
    .exec( (err,tracks)=>{

        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        Track.count({client},(err,conteo) =>{
            res.json({
                ok:true,
                total:conteo
            })
        })
    })
})

app.get('/resumeTrack', verificarToken, (req,res)=>{

  clientObject = JSON.parse(JSON.stringify(eval("(" + req.usuario.domain + ")")));
  client = clientObject[0].url;
  client = "lospatioshb.com"

    Track.find({client, code: { $ne: '' }, cta: { $ne: '' }})
    //.limit(50)
    .exec( (err,tracks)=>{
        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        let userCount = [];      
        tracks.map ( (item) =>  {
            if(userCount.indexOf(item.code) < 0){
                item.code && userCount.push(item.code)
        }})

    
        const users = {};
        tracks.forEach(function(item){
            users[item.code] = (users[item.code] || 0) + 1;
        });


        const usersDetails = {};
        tracks.forEach(function(i){
            usersDetails[i.code] = [ i.device,i.ip,i.region,i.languages,i.country,i.date ];
        });

        const ctas = {};
        tracks.forEach(function(item){
            ctas[item.cta] = (ctas[item.cta] || 0) + 1;
        });

        const devices = {};
        tracks.forEach(function(item){
            devices[item.device] = (devices[item.device] || 0) + 1;
        });

        const referers = {};
        tracks.forEach(function(item){

            if(item.referer.indexOf(item.client) < 0){
                referers[item.referer] = (referers[item.referer] || 0) + 1;
            }
           
        });

        const urls = {};
        tracks.forEach(function(item){
            urls[item.url] = (urls[item.url] || 0) + 1;
        });
        
        const regions = {};
        tracks.forEach(function(item){
            regions[item.region] = (regions[item.region] || 0) + 1;
        });

            
        const countrys = {};
        tracks.forEach(function(item){
            countrys[item.country] = (countrys[item.country] || 0) + 1;
        });

        const dates = {};
        tracks.forEach(function(item){
             fecha =  moment(item.date).format("MMM Do YY");
             dates[fecha] = (dates[fecha] || 0) + 1;    
        });
    
            
       const ctasCount = {};
       for(var i in ctas) {
        ctasCount[i.split("-")[0]] = (ctasCount[i.split("-")[0]] || 0) + 1;  
       }

       const agents = {};
       tracks.forEach(function(item){
            agents[item.agent] = (agents[item.agent] || 0) + 1;    
       });

    //   ctas.sort(function(a, b){ return a.nombre > b.nombre ? 1 : b.nombre > a.nombre ? -1 : 0 });
          res.json({
            ok:true,
            totalCtas:ctasCount,
            referers,
            devices,
            dates,
            agents,
            regions,
            countrys,
            pages:urls,
            ctas,
            users,
            usersDetails,
            totalUsers:userCount.length
         })
    })
 
})

app.get('/flowbyuser/:code', verificarToken, (req,res)=>{

    clientObject = JSON.parse(JSON.stringify(eval("(" + req.usuario.domain + ")")));
    client = clientObject[0].url;

    //Cantidad de usuarios que vieron la pagina web 
    //let client = req.params.client;
    let code   = req.params.code;

    Track.find({client, code, cta: { $ne: '' }})
    .sort({date: -1})
    .exec( (err,tracks)=>{
        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        let userCount = [];      
        tracks.map ( (item) =>  {
            if(userCount.indexOf(item.code) < 0){
                item.code && userCount.push(item.code)
        }})

        const users = {};
        tracks.forEach(function(item){
            users[item.code] = (users[item.code] || 0) + 1;
        });

        const usersDetails = {};
        tracks.forEach(function(i){
            usersDetails[i.code] = [ i.device,i.ip,i.region,i.languages,i.country,i.date ];
        });

        const ctas = {};
        tracks.forEach(function(item){
            ctas[item.cta] = (ctas[item.cta] || 0) + 1;
        });

        const devices = {};
        tracks.forEach(function(item){
            devices[item.device] = (devices[item.device] || 0) + 1;
        });

        const referers = {};
        tracks.forEach(function(item){

            if(item.referer.indexOf(item.client) < 0){
                referers[item.referer] = (referers[item.referer] || 0) + 1;
            }
        });

        const urls = {};
        tracks.forEach(function(item){
            urls[item.url] = (urls[item.url] || 0) + 1;
        });
        
        const regions = {};
        tracks.forEach(function(item){
            regions[item.region] = (regions[item.region] || 0) + 1;
        });
    
        const countrys = {};
        tracks.forEach(function(item){
            countrys[item.country] = (countrys[item.country] || 0) + 1;
        });

        const dates = {};
        tracks.forEach(function(item){
             fecha =  moment(item.date).format("MMM Do YY");
             dates[fecha] = (dates[fecha] || 0) + 1;    
        });


        const agents = {};
        tracks.forEach(function(item){
             agents[item.agent] = (agents[item.agent] || 0) + 1;    
        });
    
    
       const ctasCount = {};
       for(var i in ctas) {
        ctasCount[i.split("-")[0]] = (ctasCount[i.split("-")[0]] || 0) + 1;  
       }

          res.json({
            ok:true,
            totalCtas:ctasCount,
            referers,
            devices,
            dates,
            regions,
            countrys,
            pages:urls,
            ctas,
            users,
            agents,
            usersDetails,
            tracks
         })
    })
 
})

app.post('/track', (req,res) => {
    
    let parametro = req.body;

    if(parametro.newUser==='1'){

        push.send("Los Patios HB","Tienes un nuevo visitante desde "+parametro.referer+" Región:"+parametro.region+" País: "+parametro.country, function (err, res){
            if(err){
                console.log("We have an error:");
                console.log(err);
                console.log(err.stack);
            }
        });

        const message = `Tienes un nuevo visitante desde  ${parametro.referer}  Región: ${parametro.region}  País: ${parametro.country}`;
        var msg = {
            m: "Los Patios HB",message,   // message (required)
            t: "Los Patios HB",                     // title (optional)
            s: '8',                                // sound (value 0-50) 
            v: '2',                                // vibration (empty or value 1-3) 
            i: '5',                                // icon (value 1-176)
            c: '#FF0000',                          // iconcolor (optional)
            u: 'https://www.lospatioshb.com'+parametro.url,        // url (optional)
            ut: 'Visitar',                       // url title (optional)
            d: 'gs2599'                               // the device or device group id 
        };

        p.send( msg, function( err, result ) {
            console.log( 'RESULT', result );
        });
    }

    let track  = new Track({
            type:parametro.type,
            campaign:parametro.campaign,
            user:parametro.user,
            ip:parametro.ip,
            device:parametro.device,
            url:parametro.url,
            code:parametro.code,
            region:parametro.region,
            referer:parametro.referer,
            date:parametro.date,
            languages:parametro.languages,
            country:parametro.country,
            agent:parametro.agent,
            cta:parametro.cta,
            client:parametro.client,
            newUser:parametro.newUser
    })

    track.save(( err,trackDB ) =>{

            if( err ) {
                res.status(400).json({
                    ok:false,
                    err,
                    message:'Falla en los parametros'
                })
            }
            
            res.json({
                ok:true,
                track: trackDB
            })

    })

})

module.exports = app;