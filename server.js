/* eslint-disable no-console */
var express = require('express');
// This imports the account class from the Account.js file
const { Account } = require(__dirname + '/public/js/account.js');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};
var socketIdArray = [];
var dot = {
  x: 24,
  y: 24
};
var numPlayers = 0;

const DEBUG_PLAYERS_TO_START = 1;

//Require the map file so we can sync the dotmap
var map = require('./public/assets/pacman-map1.json');

//holds the position of the dragon this tick
var blackdragon_pos = { x: 16, y: 16, flip: false };
var stringe_pos = { x: 424, y: 24, flip: false };
var innerrage_pos = { x: 0, y: 0, flip: false };
var jrreaper = { x: 0, y: 0, flip: false };

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

// var blackdragon = {x: 24, y: 24, vx: 100, vy: 100};
// var stringe = {x: 150, y: 150, vx: -100, vy: 100};
// var innerrage = {x: 200, y: 400, vx: 100, vy: -100};
// var jrreaper = {x: 430, y: 480, vx: -100, vy: -100};

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  numPlayers++;
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

  socketIdArray.push(socket.id);
    
  // sets the name of the player
  socket.on('playerName', function(nameData){
    players[socket.id].username = nameData.username;
    console.log('their name is: ' + players[socket.id].username);
    io.emit('scoreUpdate', players);
  });

  if(numPlayers >= DEBUG_PLAYERS_TO_START){
    console.log("Starting game")
    io.emit('startGame');
    socket.broadcast.emit('startGame');
  }

  // send the players object to the new player
  socket.emit('currentPlayers', players);

  // send the dot object to new player
  socket.emit('dotLocation', dot);

  // send the entire dotmap
  socket.emit('dotMap', dotArray);

  if(numPlayers == 1){
    // tell the game to spawn a red ghost
    console.log("user is first user, telling them they are dragon controller")
    socket.emit('blackdragon_controller', blackdragon_pos); 
  }

  socket.emit("spawn_blackdragon", blackdragon_pos);
  socket.emit("spawn_stringe", stringe_pos);


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
    numPlayers--;

    // remove the socket id from array
    var index = socketIdArray.indexOf(socket.id);
    if (index > -1) {
      socketIdArray.splice(index, 1);
    }

    // set a random player as the new controller of the ghost
    var socketid = socketIdArray[Math.floor(Math.random() * socketIdArray.length)];
    socket.broadcast.emit('new_blackdragon_controller', players[socketid]);
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

  socket.on('blackdragon_pos', function (pos){
    blackdragon_pos.x = pos.x;
    blackdragon_pos.y = pos.y;
    blackdragon_pos.flip = pos.flip;
    socket.broadcast.emit('blackdragon_pos', blackdragon_pos);
  });

  socket.on('stringe_pos', function (pos){
    stringe_pos.x = pos.x;
    stringe_pos.y = pos.y;
    socket.broadcast.emit('stringe_pos', stringe_pos);
  });

  socket.on('dotCollected', function (index) {

    //Nullify it's value in our dot array
    dotArray[index] = 0;

    players[socket.id].score += 342;

    // emit a message to all player that updated his score
    io.emit('scoreUpdate', players);
  });

  socket.on('destroyDot', function(index){
    console.log(index);
    socket.broadcast.emit('removeDot', index);
  });
});

server.listen(3000, function () {
  console.log(`Listening on ${server.address().port}`);
});