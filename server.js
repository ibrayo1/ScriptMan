/* eslint-disable no-console */
var express = require('express');
// This imports the account class from the Account.js file
const { Account } = require(__dirname + '/public/js/account.js');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};
var dot = {
  x: 24,
  y: 24
};

var blackdragon = {x: 24, y: 24, vx: 100, vy: 100};
var stringe = {x: 150, y: 150, vx: -100, vy: 100};
var innerrage = {x: 200, y: 400, vx: 100, vy: -100};
var jrreaper = {x: 430, y: 480, vx: -100, vy: -100};

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  // create a new player and add it to our players object
  console.log('their socket.id: ' + socket.id);
  players[socket.id] = new Account(
    socket.id, // ID
    (14 * 16) + 8, // x
    (17 * 16) + 8, // y
    0, // rotation
    0, // score intialized to zero
    '', // username is intialized to empty string
  );

  // sets the name of the player
  socket.on('playerName', function(nameData){
    players[socket.id].username = nameData.username;
    console.log('their name is: ' + players[socket.id].username);
    io.emit('scoreUpdate', players);
  });

  // send the players object to the new player
  socket.emit('currentPlayers', players);

  // send the dot object to new player
  socket.emit('dotLocation', dot);

  // send the draogn location to player
  socket.emit('blackdragonLocation', blackdragon);

  // send the stringe location to player
  socket.emit('stringeLocation', stringe);

  // send the inner rage enemy location to player
  socket.emit('innerrageLocation', innerrage);

  // sned the jr repear enemy location to player
  socket.emit('jrreaperLocation', jrreaper);

  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // send the current scores of all the players
  socket.emit('scoreUpdate', players);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });

  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].angle = movementData.angle;

    //console.log(players[socket.id].x + ' ' + players[socket.id].y);

    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  socket.on('dotCollected', function (dotLoc) {
    players[socket.id].score += 342;

    console.log(players[socket.id].score); // for debugging purposes
    
    dot.x = dotLoc.x;
    dot.y = dotLoc.y;
    io.emit('dotLocation', dot);
    // emit a message to all player that updated his score
    io.emit('scoreUpdate', players);
  });

  socket.on('blackdragonMovement', function (dragonLoc) {
    blackdragon.x = dragonLoc.x;
    blackdragon.y = dragonLoc.y;
    blackdragon.vx = dragonLoc.vx;
    blackdragon.vy = dragonLoc.vy;
    socket.broadcast.emit('blackdragonMoved', blackdragon);
  });

  socket.on('stringeMovement', function(stringeLoc){
    stringe.x = stringeLoc.x;
    stringe.y = stringeLoc.y;
    stringe.vx = stringeLoc.vx;
    stringe.vy = stringeLoc.vy;
    socket.broadcast.emit('stringeMoved', stringe);
  });

  socket.on('innerrageMovement', function(innerrageLoc){
    innerrage.x = innerrageLoc.x;
    innerrage.y = innerrageLoc.y;
    innerrage.vx = innerrageLoc.vx;
    innerrage.vy = innerrageLoc.vy;
    socket.broadcast.emit('innerrageMoved', innerrage);
  });

  socket.on('jrreaperMovement', function(jrreaperLoc){
    jrreaper.x = jrreaperLoc.x;
    jrreaper.y = jrreaperLoc.y;
    jrreaper.vx = jrreaperLoc.vx;
    jrreaper.vy = jrreaperLoc.vy;
    socket.broadcast.emit('jrreaperMoved', jrreaper);
  });

});

server.listen(3000, function () {
  console.log(`Listening on ${server.address().port}`);
});