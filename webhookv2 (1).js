//Using DialogFlow V2 Api

'use strict';

//Facebook Page access token;
const PAGE_ACCESS_TOKEN = 'EAACHAnI1XQUBAHyETRfmdvBVRVlN31ZCYxQ3wUqkIHXp7JNJCGZBn11Nf3yAMy9v1UKyhckp3MTC0c9vLUgFiCF1BNFNVqMRZANjnWmlSSyZB0kapyyS6upjhw5SXUnBARHfWYwQ9rkckOKKZBJ0JjlJKX17zy4rXFrAQTVvDAgZDZD';



const projectId = 'busarrivalbotv0'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'busarrivalbotv2';
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
  keyFilename: 'BusArrivalBOTv0-6c364183a65b.json'
});


// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Listen at a PORT
app.listen(listeningport, function () {
console.log('FB BOT V2 listening at ...' + listeningport);
});

//Test function to test this program over http GET to know if it is wired up correctly
app.get('/', function (req, res) {
res.send('FB LTA BOT V2 GET METHOD...');
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
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);

      request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
          recipient: {id: sender},
          message: {text: result.fulfillmentText}
        }
      }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
      });
    } else {
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

  if (req.body.queryResult.action === 'busarrivaltime') {

    let busstop = req.body.queryResult.parameters['BusStopNo'];
    let restUrl = 'http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=' + busstop;

    request({
                uri: restUrl,
                method: 'GET',
                headers: {'AccountKey': 'Qnkd9LUmSDG7ywX+BuCSAA=='}
            }, (err, response, body) => {
              let jsonresponse = JSON.parse(body);
              let msg = ''; //'Hi The arrival time for BusNo  \n' + jsonresponse.Services[0].ServiceNo + ' is : ' +jsonresponse.Services[0].NextBus.EstimatedArrival;

            //  for(var myKey in jsonresponse) {
            for(var i = 0; i < jsonresponse.Services.length; i++) {

                     msg = msg +  'Bus No :' + jsonresponse.Services[i].ServiceNo + ' - ETA : ' +  jsonresponse.Services[i].NextBus.EstimatedArrival;
                     msg=msg + '\n';
                    }


                return res.json({
                  fulfillmentText: msg,

                  fulfillmentMessages : [
                          {
                            "text": {
                              "text": [
                              msg
                              ]
                            }
                          }
                        ],
                          source: "Response from LTA about bus timing"
                  });
            })



  }
});
