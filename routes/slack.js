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

app.get('/mensaje', (req,res) => { 
    res.json({
        ok:true,
        mensaje: "Hello world"
    })
})

  
module.exports = app;