var SlackBot = require('slackbots');
const express = require('express');
const app = express();
const fs = require('fs');
moment = require("moment");
const { WebClient } = require('@slack/web-api');
const token = "xoxp-224498606455-233668675862-1703846489376-d42ad9b0799111e6e8e562d5b1a5935b";
const web = new WebClient(token);
const { App } = require('@slack/bolt');

const Slackuser = require('../models/slackuser');
const Slackchannel = require('../models/slackchannel');

var bot = new SlackBot({
  token:"xoxb-224498606455-1686841326421-wCDx5fvB4uhMkt6FONPcKYCg",
  name:"paisabot"
});


let conversationsStore = {};

async function populateConversationStore() {
  try {
    // Call the conversations.list method using the WebClient
    const result = await web.conversations.list({
      types: "private_channel",
      limit: 200 
    });
    saveConversations(result.channels);
  }
  catch (error) {
    console.error(error);
  }
}

function saveConversations(conversationsArray) {
  let conversationId = '';

  conversationsArray.forEach(function(conversation){
    // Key conversation info on its unique ID
    conversationId = conversation["id"];
    // Store the entire conversation object (you may not need all of the info)
    conversationsStore[conversationId] = conversation;
  });
}


bot.on('message', async function(data) {
  // all ingoing events https://api.slack.com/rtm
  //bot.postMessageToUser('pedrorojas', 'meow!', { 'slackbot': true, icon_emoji: ':cat:' }); 
 
  if(!data.text || data.type !== 'message' || data.subtype == 'bot_message' ) return;
  
  populateConversationStore();
 

  if(data.channel){
    console.log(data.channel);
    try {
      console.log(conversationsStore[data.channel].name)
      bot.postMessageToChannel(conversationsStore[data.channel].name, 'hagale sin miedooooooo!');

    } catch (error) {
      console.log("error")
    }
    
  }

  if(data.text === "mijooo"){
   // bot.postMessageToChannel(conversationsStore[data.channel].name, 'hagale sin miedooooooo!');
    
  }

});



app.post('/adduser', (req,res) => { 
    console.log(req.body);
    const params = req.body;
    fs.writeFile('slack.txt', 'Hello world!', function(err) {
        // If an error occurred, show it and return
        if(err) return console.error(err);
        // Successfully wrote to the file!
      });

      const {  
      user_name,
      user_id,
      team_id,
      team_domain,
      channel_id,
      channel_name,
      text,
      response_url
    } = params;

      let slackuser = new Slackuser({
        user_name,
      user_id,
      team_id,
      team_domain,
      channel_id,
      channel_name,
      text,
      response_url
      });

      slackuser.save((err, result) => {
        if (err) {
          res.status(400).json({
            ok: false,
            err,
            message: " Falla en los parametros",
          });
        }
    
        res.json({
            ok:true,
            result
        })
      });

});

app.post('/addconversation', (req,res) => { 
    const params = req.body;
    console.log(params);
    if(params.text){
        (async () => {
           // const res = await web.chat.postMessage({ channel: conversationId, text: 'Hello there' });
          
           console.log(params.text.trim());
           let procesado = params.text.replace(/\s+/g, '')  // > "Textodeejemplo"
           console.log(procesado);

            const result1 = await web.conversations.create({
              name: String(procesado)
            });



            console.log(result1);
          
                let slackchannel = new Slackchannel({
                    name: params.text.trim()
                });
          
                slackchannel.save((err, result) => {
                    if (err) {
                      res.status(400).json({
                        ok: false,
                        err,
                        message: " Falla en los parametros",
                      });
                    }
                
                    res.json({
                        ok:true,
                        id: result1.id
                    })
                  });

          })();
    }
    
}); 

app.post('/play', (req,res) => { 


    Slackuser.find()
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

    
var listado = [1,2,3,4];
const  Total = listado.length;
var aleatorio = "";
var seleccion = "";
var newArray = [];
const limit = 3;

for (i=0; i <= Total; i++) {
aleatorio = Math.floor(Math.random()*(listado.length));
seleccion = listado[aleatorio];
listado.splice(aleatorio, 1);
newArray.push(seleccion);
if(limit <= (i+1)){
    break;
}

}

 let userArray = [];

newArray.map( item => {
    userArray.push(result[parseInt(item)].user_id);
})

const users__ = userArray.join(",");

    
      if(result){

        (async () => {
            // const res = await web.chat.postMessage({ channel: conversationId, text: 'Hello there' });
           

             const result = await web.conversations.invite({
                 channel: "C01LGSBEH8R",
                 users: users__
             });
    
             res.json({
                 ok:true,
                 result
             })
    
    
           })();
    
           res.json({
            ok: true,
          });
      }
    
    
    });

     
    
});

module.exports = app;