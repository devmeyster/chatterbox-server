/* Import node's http module: */

var app = require("./request-handler.js");

var express = require('express');

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
