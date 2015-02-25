/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var _ = require('underscore');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');


var getStorage = function(callback){
  fs.readFile('server/database', callback);
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/classes/:roomname?', function (req, res) {

  var roomname = req.params.roomname;

  getStorage(function(err, data){
    if(err){ throw err; }

    var storage = JSON.parse(data);
    if(roomname === undefined){
      res.json(storage);
    }else{
      var results = _.filter(storage.results, function(item){
        return (item['roomname'] === roomname);
      })
      var obj = {};
      obj.results = results;
      res.json(obj);
    }

  });
});


app.post('/classes/:roomname?', function(req, res){

  var roomname = req.params.roomname || '';

  var data = req.body;

  var newData = {};

  newData.username = data.username;
  newData.message = data.message;
  newData.roomname = roomname;

  getStorage(function(err, data){
    if(err){
      throw err;
    }
    var storage = JSON.parse(data);

    var newId;
    if(storage.results[0] === undefined){
      newId = 1;
    }else{
      newId = storage.results[0]['objectId']+1;
    }

    newData.objectId = newId;

    storage.results.unshift(newData);
    fs.writeFile('server/database', JSON.stringify(storage));
    // res.json(newData);
    res.end();
  });

});


app.use('/', express.static('./client'));

module.exports = app;


