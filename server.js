var express = require('express');
// This imports the account class from the Account.js file
const { Account } = require(__dirname + '/public/js/account.js');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};
var dot = {
  x: 30,
  y: 30
};

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  // create a new player and add it to our players object
  console.log('their socket.id: ' + socket.id)
  players[socket.id] = new Account(
    socket.id, // ID
    (14 * 16) + 8, // x
    (17 * 16) + 8, // y
    0, // rotation
    0 // score intialized to zero
  );

  // send the players object to the new player
  socket.emit('currentPlayers', players);
  
  // send the dot object to new player
  socket.emit('dotLocation', dot);

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
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  socket.on('dotCollected', function (dotLoc) {
    players[socket.id].score += 10;

    console.log(players[socket.id].score); // for debugging purposes
    
    dot.x = dotLoc.x;
    dot.y = dotLoc.y;
    io.emit('dotLocation', dot);
    // emit a message to all player that updated his score
    io.emit('scoreUpdate', players);
  });

});

server.listen(3000, function () {
  console.log(`Listening on ${server.address().port}`);
});