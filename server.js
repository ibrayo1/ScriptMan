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
var numPlayers = 0;

const DEBUG_PLAYERS_TO_START = 1;

//Require the map file so we can sync the dotmap
var map = require('./public/assets/pacman-map1.json');

//holds the position of the red ghost this tick
var red_ghost_pos = {
  x: 1,
  y: 1
}
var blue_ghost_pos = {
  x: 30,
  y: 30
}

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
    console.log("user is first user, telling them they are ghost controller")
    socket.emit('red_ghost_controller', red_ghost_pos); 
  }

  socket.emit("spawn_red_ghost", red_ghost_pos);
  socket.emit("spawn_blue_ghost", blue_ghost_pos);


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

  socket.on('red_ghost_pos', function (pos){
    red_ghost_pos.x = pos.x;
    red_ghost_pos.y = pos.y;
    socket.broadcast.emit('red_ghost_pos', red_ghost_pos);
  });

  socket.on('blue_ghost_pos', function (pos){
    blue_ghost_pos.x = pos.x;
    blue_ghost_pos.y = pos.y;
    socket.broadcast.emit('blue_ghost_pos', red_ghost_pos);
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