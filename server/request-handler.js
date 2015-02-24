/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var _ = require("underscore");
var fs = require('fs');
var storage = {};
storage.results = [];
var objectId = 1;

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log("Serving request type " + request.method + " for url " + request.url);
  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = "text/plain";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  // response.write(request.url);
  var urlElems = request.url.split("/");

  if(urlElems[1] === "classes"){

    var roomname = urlElems[2];

    if(request.method === 'GET'){
      //return username and msg
      headers['Content-Type'] = "application/json";
      response.writeHead(statusCode, headers);

      if(urlElems[2] === ''){
        response.end(JSON.stringify(storage));
      }else{
        var results = _.filter(storage.results, function(item){
         return (item['roomname'] === roomname);
        })
        var obj = {};
        obj.results = results;
        response.end(JSON.stringify(obj));
      }

    }else if(request.method === 'POST'){
      statusCode = 201;
      headers['Content-Type'] = "application/json";
      response.writeHead(statusCode, headers);

      var body = "";
      request.on('data', function(data){
        body += data;
      });

      request.on('end', function(){

        var data = JSON.parse(body);
        var newData = {};

        newData.username = data.username;
        newData.message = data.message;
        newData.roomname = roomname;
        newData.objectId = objectId;
        objectId++;
        storage.results.unshift(newData);
        response.end(JSON.stringify(newData));
      });

    }
  }else if(request.url === "/log"){
    statusCode = 200;
    headers['Content-Type'] = "application/json";
    response.writeHead(statusCode, headers);
    response.end("TEST");

  // }else if(request.url === "/"){
  //   statusCode = 200;
  //   headers['Content-Type'] = "text/html";
  //   response.writeHead(statusCode, headers);
  //   // fs.exists('client/index.html', function(exists){
  //   //   if(exists){
  //   //     response.write("EXISTS");
  //   //   }else{
  //   //     response.write("DOESNT EXISTS");
  //   //   }
  //   //   response.end();
  //   // });
  //   fs.readFile('client/index.html', function(err, html){
  //     statusCode = 200;
  //     headers['Content-Type'] = "text/html";
  //     response.writeHead(statusCode, headers);
  //     if(err){
  //       throw err;
  //     }

  //     response.write(html);
  //     response.end();
  //   });
  // }else if(request.url === "/styles/styles.css"){
  //   statusCode = 200;
  //   headers['Content-Type'] = "text/html";
  //   response.writeHead(statusCode, headers);
  //   fs.readFile('client/styles/', function(err, html){
  //     statusCode = 200;
  //     headers['Content-Type'] = "text/html";
  //     response.writeHead(statusCode, headers);
  //     if(err){
  //       throw err;
  //     }

  //     response.write(html);
  //     response.end();
  //   });
  }else{
    fs.exists('client' + request.url, function(exists){
      if(exists){
        fs.readFile('client/' + request.url, function(err, html){
          statusCode = 200;
          var extention = request.url.split('.');
          extention = extention[extention.length-1];

          if(extention === 'js'){
            headers['Content-Type'] = "text/javascript";
          }else if(extention === 'html'){
            headers['Content-Type'] = "text/html";
          }else if(extention === 'css'){
            headers['Content-Type'] = "text/css";
          }else if(extention === 'gif'){
            headers['Content-Type'] = "image/gif";
          }

          response.writeHead(statusCode, headers);
          if(err){
            throw err;
          }

          response.write(html);
          response.end();
        });
      }else{
        statusCode = 404;
        headers['Content-Type'] = "application/json";
        response.writeHead(statusCode, headers);
        response.end();
      }
    })

  }
  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  // response.end("Hello, World!");
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

exports.requestHandler = requestHandler;
