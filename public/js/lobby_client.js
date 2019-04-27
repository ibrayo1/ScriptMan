"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lobby = require("./lobby_server");
let blueBox = document.getElementById("blueBox");
blueBox.onclick(this.chooseBlue());
let yellowBox = document.getElementById("yellowBox");
yellowBox.onclick(this.chooseYellow());
let greenBox = document.getElementById("greenBox");
greenBox.onclick(this.chooseGreen());
let purpleBox = document.getElementById("purpleBox");
purpleBox.onclick(this.choosePurple());
var usernameBox = document.getElementById("usernameBox").nodeValue;
// Functions called if player has chosen the respective color
function chooseBlue() {
    // TODO
}
function choosePurple() {
    // TODO
}
exports.choosePurple = choosePurple;
function chooseGreen() {
    // TODO
}
exports.chooseGreen = chooseGreen;
function chooseYellow() {
    // TODO
}
exports.chooseYellow = chooseYellow;
function usernameChanged(name) {
    lobby.lobby_changed_username(name);
    lobby.io.emit('username changed', function (socket) {
        lobby.playerUsernameHash[socket.id] = name;
        console.log(`Username changed to ${name}`);
    });
}
exports.usernameChanged = usernameChanged;
