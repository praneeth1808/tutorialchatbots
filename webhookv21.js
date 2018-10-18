//APPID: 938509606355628

'use strict';

//Facebook Page access token;
const PAGE_ACCESS_TOKEN = 'EAANVkcu0gqwBAFlLWbZCwy1tFY4rb2cj7IcveiuiFM7CEKBwtKr13DAIZBLQvDIAsIBTTz31HxnMU8pQ2UuU6zAlYBar7ZCasyJTPLZBI1kYziNRZB4xBGLsEYDqKttji8X8E4NcDO0jV22VfSgMSPcdVn9M7zwIWbwxxk5dKCAZDZD';
const projectId = 'bob-ssautk'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'richmsgv2';
const languageCode = 'en-US';

var listeningport = process.env.PORT || 4000;
//Refernce Express , Bodyparser, Request, DialogFlow

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

//DialogFlow V2
const dialogflow = require('dialogflow');
//const sessionClient = new dialogflow.SessionsClient();

const sessionClient = new dialogflow.SessionsClient({
  keyFilename: 'BOB-ssautk-7d6d26739ffe.json'
});


// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Listen at a PORT
app.listen(listeningport, function () {
console.log('RichMsg  V2 listening at ...' + listeningport);
});

//Test function to test this program over http GET to know if it is wired up correctly
app.get('/', function (req, res) {
res.send('RichMsg V2 GET METHOD...');
});

//Instantiate dialogflow object
/* For Facebook Validation. This is called during webhook setup in FB. make sure the verify token match */
app.get('/fbwebhookv2', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'VERIFY_TOKEN') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});


/* Handling all messenges from  FB*/
app.post('/fbwebhookv2', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          processMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});




function processMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  //Send the msg received from FB Messenger to DialogFlow and wait for the response from DialogFlow
  // The text query request.
  const request2df = {
    session: sessionPath,
    queryInput: {
      text: {
        text: text,
        languageCode: languageCode,
      },
    },
  };

  // Listen for response from DialogFlow
  //Before this 'response' is executed, DialogFlow wud have alrady POSTed to /ai URL which returns the response. We use same  response to send to FB
sessionClient
  .detectIntent(request2df)
  .then(responses => {
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    console.log(`  Action: ${result.action}`);



    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);

      switch(result.action){
        case 'SHOP_WELCOME':
            console.log('Sending FB msg..SHOP WELCOME');

            request({
              url: 'https://graph.facebook.com/v2.6/me/messages',
              qs: {access_token: PAGE_ACCESS_TOKEN},
              method: 'POST',
              json: {
                recipient: {id: sender},
                message: {text: result.fulfillmentText,
                quick_replies : [
                  {
                    content_type : 'text',
                    title : 'SHIRT',
                    payload: 'DEVELOPER_SHIRT'
                     //"image_url":"http://example.com/img/red.png"
                  },
                  {
                    content_type : 'text',
                    title : 'PANT',
                    payload: 'DEVELOPER_PANT'
                     //"image_url":"http://example.com/img/red.png"
                  },
                  {
                    content_type : 'text',
                    title : 'TEE',
                    payload: 'DEVELOPER_TEE'
                    // "image_url":"http://example.com/img/red.png"
                  }
                ]
                   }
              }
            }, (error, response) => {
              if (error) {
                  console.log('Error sending message: ', error);
              } else if (response.body.error) {
                  console.log('Error: ', response.body.error);
              }
            });
        break;

        case 'DRESS_OPTION':
          //console.log(result);

            if(result.queryText == 'SHIRT' || result.queryText == 'TEE'){

                console.log('Sending FB msg..SHIRT n TEES');

                request({
                  url: 'https://graph.facebook.com/v2.6/me/messages',
                  qs: {access_token: PAGE_ACCESS_TOKEN},
                  method: 'POST',
                  json: {
                    recipient: {id: sender},
                    message: {text: result.fulfillmentText,
                    quick_replies : [
                      {
                        content_type : 'text',
                        title : 'M',
                        payload: 'SIZE_M'
                         //"image_url":"http://example.com/img/red.png"
                      },
                      {
                        content_type : 'text',
                        title : 'L',
                        payload: 'SIZE_L'
                         //"image_url":"http://example.com/img/red.png"
                      },
                      {
                        content_type : 'text',
                        title : 'XL',
                        payload: 'SIZEXL'
                        // "image_url":"http://example.com/img/red.png"
                      },
                      {
                        content_type : 'text',
                        title : 'XXL',
                        payload: 'SIZEXXL'
                        // "image_url":"http://example.com/img/red.png"
                      }
                    ]
                       }
                  }


                }, (error, response) => {
                  if (error) {
                      console.log('Error sending message: ', error);
                  } else if (response.body.error) {
                      console.log('Error: ', response.body.error);
                  }
                });
              }
              else if (result.queryText == 'PANT') {

                console.log('Sending FB for pants');
                request({
                  url: 'https://graph.facebook.com/v2.6/me/messages',
                  qs: {access_token: PAGE_ACCESS_TOKEN},
                  method: 'POST',
                  json: {
                    recipient: {id: sender},
                    message: {text: result.fulfillmentText,
                    quick_replies : [
                      {
                        content_type : 'text',
                        title : '30',
                        payload: 'SIZE_M'
                         //"image_url":"http://example.com/img/red.png"
                      },
                      {
                        content_type : 'text',
                        title : '32',
                        payload: 'SIZE_L'
                         //"image_url":"http://example.com/img/red.png"
                      },
                      {
                        content_type : 'text',
                        title : '34',
                        payload: 'SIZEXL'
                        // "image_url":"http://example.com/img/red.png"
                      },
                      {
                        content_type : 'text',
                        title : '36',
                        payload: 'SIZEXXL'
                        // "image_url":"http://example.com/img/red.png"
                      }
                    ]
                       }
                  }


                }, (error, response) => {
                  if (error) {
                      console.log('Error sending message: ', error);
                  } else if (response.body.error) {
                      console.log('Error: ', response.body.error);
                  }
                });
              }
              break;
      }
    }
      else {
        console.log(`No intent matched.`);
      }
    })
    .catch(err => {
      console.error('ERROR: V2 DF', err);
    });


    }

//Web Hook for DialogFlow. It posts this method

app.post('/dfwebhookv2', (req, res) => {

  console.log('*** Call from DialogFlow ***');
  //console.log(req.body.queryResult);
  switch(req.body.queryResult.action){
    case 'SHOP_WELCOME':
          return res.json({
          fulfillmentText: 'Hello and Welcome. What would you like to buy today :'});
          break;
    case 'DRESS_OPTION':

          return res.json({
          fulfillmentText: 'What is your size:'});
          break;

  }




});
