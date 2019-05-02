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

//Require the map file so we can sync the dotmap
var map = require('./public/assets/pacman-map1.json');

//Get the map data
map = map.layers[0].data;

//Setup an array corresponding to the map dot data
//For every 7, or "dot"
var dotArray = [];
for(var i = 0; i < map.length; i++){
  if(map[i] == 7){
    dotArray.push(1);
  }
}

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

  // send the entire dotmap
  socket.emit('dotMap', dotArray);

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

  socket.on('destroyDot', function(index){
    dotArray[index] = 0;
    io.emit('removeDot', index);

  });
});

server.listen(3000, function () {
  console.log(`Listening on ${server.address().port}`);
});