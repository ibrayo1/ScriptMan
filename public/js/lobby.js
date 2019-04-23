"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
var app = express();
const http_1 = require("http");
let server = new http_1.Server(app);
const IO = __importStar(require("socket.io"));
var playersAccountHash = {};
var playersPlayerRankHash = {};
var number_of_sockets = 0;
var io = IO.listen(server);
var PlayerNumber;
(function (PlayerNumber) {
    PlayerNumber[PlayerNumber["PlayerOne"] = 0] = "PlayerOne";
    PlayerNumber[PlayerNumber["PlayerTwo"] = 1] = "PlayerTwo";
    PlayerNumber[PlayerNumber["PlayerThree"] = 2] = "PlayerThree";
    PlayerNumber[PlayerNumber["PlayerFour"] = 3] = "PlayerFour";
})(PlayerNumber || (PlayerNumber = {}));
app.use(express.static('/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/lobby.html');
});
io.on('connection', function (socket) {
    if (number_of_sockets === 0) {
        document.getElementById('playerOne').className = socket.id;
        playersPlayerRankHash[socket.id] = PlayerNumber.PlayerOne;
        document.getElementById('playerOne').innerText = "Player One: Connected";
    }
    else if (number_of_sockets === 1) {
        document.getElementById('playerTwo').className = socket.id;
        playersPlayerRankHash[socket.id] = PlayerNumber.PlayerTwo;
    }
    else if (number_of_sockets === 2) {
        document.getElementById('playerThree').className = socket.id;
        playersPlayerRankHash[socket.id] = PlayerNumber.PlayerThree;
    }
    else if (number_of_sockets === 3) {
        document.getElementById('playerFour').className = socket.id;
        playersPlayerRankHash[socket.id] = PlayerNumber.PlayerFour;
    }
    number_of_sockets += 1;
});
let blueBox = document.getElementById("blueBox");
blueBox.onclick(this.chooseBlue());
let yellowBox = document.getElementById("yellowBox");
yellowBox.onclick(this.chooseYellow());
let greenBox = document.getElementById("greenBox");
greenBox.onclick(this.chooseGreen());
let purpleBox = document.getElementById("purpleBox");
purpleBox.onclick(this.choosePurple());
var usernameBox = document.getElementById("usernameBox").nodeValue;
function usernameChanged(name) {
    io.emit('username changed', (socket) => {
    });
}
// This will get the number of the player whose socket ID is passed
// as an argument
function getPlayerNumber(socketID) {
    return playersPlayerRankHash[socketID];
}
// Functions called if player has chosen the respective color
function chooseBlue() {
    // TODO
}
function choosePurple() {
    // TODO
}
function chooseGreen() {
    // TODO
}
function chooseYellow() {
    // TODO
}
