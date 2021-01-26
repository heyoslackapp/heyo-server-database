const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const fs = require('fs');
const publicIp = require('public-ip');
const _ = require('underscore');
const { verificarToken,isAdmin } = require('../middlewares/autenticacion');
moment = require("moment");
const multer = require('multer');
var webp=require('webp-converter');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+Math.floor(Math.random() * 10000))
    }
  })
   
  var upload = multer({ storage: storage })

const { google } = require('googleapis');
var analytics = google.analytics('v3');
var geoip = require('geoip-lite');

var ApiKeyFile = require('../key.json');
var Key = getdefaultObj(ApiKeyFile);
function getdefaultObj(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var viewID = 'ga:230186340';

(async () => {
    const ip  = await publicIp.v4();
    const geo = geoip.lookup(ip);
})();

// We use JWT to authenticate with Google and give us access to data
var jwtClient = new google.auth.JWT(Key.default.client_email, null, Key.default.private_key, ['https://www.googleapis.com/auth/analytics.readonly'], null);


function queryData(analytics, dimensions, metrics, res) {
    analytics.data.ga.get({
        'auth': jwtClient,
        'ids': viewID,
        'dimensions': dimensions,
        'metrics': metrics,
        'start-date': '30daysAgo',
        'end-date': 'today',
    }, function (err, response) {
        if (err) {
            console.log(err);
            return err;
        }
        return res.send(response.data);
    });
}

const Action = require('../models/action');
const Page = require('../models/page');
const Imagen = require('../models/image');

app.post('/add', (req,res) => { 
    let parametro = req.body;
    let action  = new Action({
        event:parametro.event,
        code:parametro.code,
        client:'lospatioshb.com',
        contact:parametro.user 
    })

    action.save(( err,eventDB ) =>{
       
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
            event: eventDB
        })

    })
    
})

app.get('/analytics/users/countries', (req, res) => {
    var dimensions = 'ga:country';
    var metrics = 'ga:users';
    queryData(analytics, dimensions, metrics, res);
})

app.get('/analytics/users/browser', (req, res) => {
    var dimensions = 'ga:pageLoadTime';
    var metrics = 'ga::';
    queryData(analytics, dimensions, metrics, res);
})

app.get('/analytics/users/now', async (req, res) => {
    dimensions = 'ga:country';
    metrics = 'rt:activeUsers';
    queryRealTimeData(analytics, dimensions, metrics, res);
});

function queryRealTimeData(analytics, dimensions, metrics, res) {
analytics.data.realtime.get({
    'auth': jwtClient,
    'ids': viewID,
    'dimensions': dimensions,
    'metrics': metrics
}, function (err, response) {
    if (err) {
        console.log(err);
        return err;
    }
    return res.send(response.data);
});
}

app.post('/page',(req,res)=>{

    let parametro = req.body;
    const client = 'lospatioshb.com'; 

    let page  = new Page({
        referrer: parametro.r,
        user: parametro.u,
        device: parametro.d,
        width: parametro.w,
        url:  parametro.p,
        downlink:  parametro.dl,
        platform: parametro.pf,
        language: parametro.l,
        userAgent: parametro.g,
        speed: parametro.s,
        country: '9' ,
        region: '6',
        city: '4',
        ll: '4' ,
        ip:'0' ,
        responsive:parametro.g ,
        date:moment.now(),
        client
    })

    page.save(( err,eventDB ) =>{
       
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
            event: eventDB
        })

    })

})



app.get('/search', (req,res)=>{
    //let code   = req.params.code;
    const client = 'lospatioshb.com'; 
    Action.find({client, code: { $ne: '' } }).exec( (err,action)=>{
        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

    const codigo = {};
    action.forEach(function(item){
        codigo[item.code] = (codigo[item.code] || 0) + 1;
    });

    res.json({
        ok:true,
        codigo
     })
})

})

app.get('/searchV2', (req,res)=>{
    //let code   = req.params.code;
    const client = 'lospatioshb.com'; 
    Page.find({client}).exec( (err,data)=>{
        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

    const device = {};
    data.forEach(function(item){
        device[item.device] = (device[item.device] || 0) + 1;
    });

    const url = {};
    data.forEach(function(item){
        url[item.url] = (url[item.url] || 0) + 1;
    });


    const userp = {};
    data.forEach(function(item){
        userp[item.user] = (userp[item.user] || 0) + 1;
    });


    res.json({
        ok:true,
        device,
        url,
        users:Object.keys(userp).length,
        views:data.length
     })
})

})

app.get('/searchByPage', (req,res)=>{
    //let code   = req.params.code;
    const client = 'lospatioshb.com'; 
    const url = '/'; 

    Page.find({client,url}).exec( (err,data)=>{
        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

    const device = {};
    data.forEach(function(item){
        device[item.device] = (device[item.device] || 0) + 1;
    });

    const userp = {};
    data.forEach(function(item){
        userp[item.user] = (userp[item.user] || 0) + 1;
    });

    let desktop = 0;
    let mobile = 0;

    data.forEach(function(item){
        if(item.userAgent){
            if(item.userAgent==="web"){
                desktop =  desktop + 1;
            }else{
                mobile = mobile + 1;
            }
        }
       
    });

    

    let speedTotal = 0;
    let speedCount = 0;
    let speedHigh = 0;
    let downlink = 0;

    data.forEach(function(item){
        if((parseFloat(item.speed)>0)&&(parseFloat(item.speed))){
            speedTotal = speedTotal + parseFloat(item.speed);
            speedCount = speedCount + 1;
            if(speedHigh<parseFloat(item.speed)){
                speedHigh = parseFloat(item.speed);
                downlink = parseFloat(item.downlink);
            }
        }
    });
    
    promedioSpeed = speedTotal/speedCount;


    res.json({
        ok:true,
        device,
        downlink,
        desktop,
        mobile,
        speedPromedio: Math.round(parseFloat(promedioSpeed) * 100) / 100,
        speedHigh:Math.round(parseFloat(speedHigh) * 100) / 100,
        users:Object.keys(userp).length,
        views:data.length
     })
})

})

app.get('/imagenes', (req,res)=>{

    //let code   = req.params.code;


    Imagen.find().exec( (err,action)=>{
        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

    res.json({
        ok:true,
        action
     })
})

})

app.post('/uploadphoto/:id', upload.single('picture'), (req, res) => {
    
    let conferenceId = req.params.id;
    const img = fs.readFileSync(req.file.path);
    const encode_image = img.toString('base64');
    const finalImg = {
        contentType: req.file.mimetype,
        image:  new Buffer(encode_image, 'base64')
    };

    let image  = new Imagen({
        contentType: req.file.mimetype,
        image: req.file.filename,
        conferenceId:conferenceId
    })

    image.save(finalImg, (err, result) => {
        if (err) return console.log(err)
        res.json({
            ok:true,
        })
    })

})

app.get('/convert', (req,res)=>{
    let parametro = req.body;
    webp.cwebp(parametro.foto,"foto.webp","-q 80",function(status,error)
  {

      res.json({
        ok:true,
        status
     })
  });
})
  
module.exports = app;