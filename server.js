var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var players = {};
// not sure if this is correct but oh well
app.use(express.static(__dirname + '/static/index.html'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/static/index.html");
    console.log("Hi");
});
server.listen(8080, function () {
    console.log("Listening on " + server.address().port);
});
