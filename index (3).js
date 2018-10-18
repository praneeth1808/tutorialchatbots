'use strict';

var listeningport = process.env.PORT || 3000;

const express = require('express');
const bodyParser = require('body-parser');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.listen(listeningport, function () {
console.log('BOT listening at ...' + listeningport);
});



app.post('/slotfill', (req,res) => {

  console.log('*** Webhook for slotfill query ***');

  if (req.body.result.action === 'a_fetch_user_details') {
    console.log('Fetch user action fired');

    if (req.body.result.parameters['username'] != ''){

      return res.json({
         speech: "Fetched User details.",
          displayText: "Fetched user details.. ",
          followupEvent : {
            "data" : {
                    "pizzatype" : req.body.result.parameters['pizzatype'],
                    "pizzasize": req.body.result.parameters['pizzasize'],
                    "username" : req.body.result.parameters['username'],
                    "address1" : "woodlands drive 73",
                    "address2" :" New jersy....",
                    "PhoneNo" :"6512345678",
                    "email" :"someone@somewhere.com"
                  },
                   name : "e_fetch_user_details"
                 },
                  source: "from slotfill"

                  });


    }

  }

  });


  app.post('/validate', (req, res) => {

    console.log('*** Webhook for Validating user input ***');

    if (req.body.result.action === 'CHECK-PIZZA-SIZE') {

          console.log('Action CHECK PIZZA SIZE recognised..');
          let pizzasize = req.body.result.parameters['pizzasize'];

          if(pizzasize != 12 && pizzasize != 18){
                console.log('Webhook Firing Pizza Invalid Event');

                return res.json({
                   speech: "Pizza Size Invalid",
                   displayText: "Pizza Size Invalid.. ",
                   followupEvent : {
                       name : "e_Pizza_Invalid",
                       data: { prompt: "I am sorry, thats not a valid pizza size"}
                    },
                    source: "from our WS"
                });

            }
            else {

              console.log('Webhook Firing Pizza VALID Event');

              return res.json({
                 speech: "Thank you for your order..",
                 displayText: "Thank you for your order ",
                 followupEvent : {
                     name : "e_pizzasize_valid",
                     data: { prompt: "Thank you for your order"}
                  },
                  source: "from our WS"
                  });

            }
}

});
