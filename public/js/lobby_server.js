"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
var app = express();
var server = require('http').Server(app);
exports.io = require('socket.io').listen(server);
exports.playersPlayerRankHash = {};
exports.playerUsernameHash = {};
exports.number_of_sockets = 0;
const path = require("path");
var PlayerNumber;
(function (PlayerNumber) {
    PlayerNumber[PlayerNumber["PlayerOne"] = 0] = "PlayerOne";
    PlayerNumber[PlayerNumber["PlayerTwo"] = 1] = "PlayerTwo";
    PlayerNumber[PlayerNumber["PlayerThree"] = 2] = "PlayerThree";
    PlayerNumber[PlayerNumber["PlayerFour"] = 3] = "PlayerFour";
})(PlayerNumber || (PlayerNumber = {}));
var public_path = path.resolve('.');
app.use(express.static(public_path + '/public/'));
app.get('/', (req, res) => {
    var lobbyPath = path.resolve(__dirname + '../public');
    res.sendFile('lobby.html', { root: '.' });
});
exports.io.on('connection', function (socket) {
    if (exports.number_of_sockets === 0) {
        //document.getElementById('playerOne').className = socket.id
        exports.playersPlayerRankHash[socket.id] = PlayerNumber.PlayerOne;
        //document.getElementById('playerOne').innerText = "Player One: Connected"
    }
    else if (exports.number_of_sockets === 1) {
        //document.getElementById('playerTwo').className = socket.id
        exports.playersPlayerRankHash[socket.id] = PlayerNumber.PlayerTwo;
    }
    else if (exports.number_of_sockets === 2) {
        //document.getElementById('playerThree').className = socket.id
        exports.playersPlayerRankHash[socket.id] = PlayerNumber.PlayerThree;
    }
    else if (exports.number_of_sockets === 3) {
        //document.getElementById('playerFour').className = socket.id
        exports.playersPlayerRankHash[socket.id] = PlayerNumber.PlayerFour;
    }
    exports.number_of_sockets += 1;
});
// This will get the number of the player whose socket ID is passed
// as an argument
function getPlayerNumber(socketID) {
    return exports.playersPlayerRankHash[socketID];
}
server.listen(3000, () => {
    console.log(`Listening on ${server.address().port}`);
});
function lobby_changed_username(name) {
    exports.io.emit('username changed', (socket) => {
        exports.playerUsernameHash[socket.id] = name;
        console.log(`Username changed to ${name}`);
    });
}
exports.lobby_changed_username = lobby_changed_username;
