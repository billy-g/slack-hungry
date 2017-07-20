var express = require('express');
var app = express();
const Zomato = require('zomato.js');
//api_key to be replaced by process.env.ZO_ACCESS variable
const z = new Zomato(process.env.ZO_ACCESS);
var lodash = require('lodash');
var request = require('request');
//driver for testing
//var term = "Korean";
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//use port is set in the environment variable, or 9001 if it isn’t set.
app.set('port', (process.env.PORT || 9001));

//for testing that the app is running
app.get('/', function(req, res) {
  res.send('slack-mato is running');
});

//app.post is triggered when a POST request is sent to the URL ‘/post’
app.post('/post', function(req, res) {

  //take slack command param for cuisine type; all-caps in order to bypass case-sensitivity
  var term = (req.body.text).toUpperCase();

  //pull array of all cuisine_names and cuisine_ids based on location
  z.cuisines({city_id: 306}).then(function(cuisines) {

    //pull cuisine_id from the cuisine array via uppercase term in order to use case-insensitive message
    var cuisine = lodash.filter(cuisines, x => x.cuisine_name.toUpperCase() === term);
    cuisine_id = cuisine[0]["cuisine_id"]
    console.log(cuisine_id);

    //do another search based on the cuisine_id
    z.search({city_id: 306, cuisines: cuisine_id}).then(function(restaurants) {
      //create a random number based on cuisines array length in order to pick a random item in array
      rand = Math.floor(Math.random() * restaurants.length) + 1
      restaurant = (restaurants[rand]);
      var rest_name = restaurant["name"];
      var rest_address = restaurant["location"]["address"];
      var body = {
        response_type: "in_channel",
        "attachments": [
          {
            "text": "Restaurant: " + rest_name + "\n" + "Address: " + rest_address + "\n"
          }
        ]
      };
      res.send(body);

    }).catch(function(err) {
      console.error(err);
    });
  }).catch(function(err) {
    console.error(err);
  });

});

//tells Node which port to listen on
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
