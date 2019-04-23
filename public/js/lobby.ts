import { Account } from "./account"
import * as s from 'http'

import * as express from 'express'
var app = express()
import { Server } from 'http';
let server = new Server(app);
import * as io from 'socket.io'
var players = {};
var number_of_sockets = 0


app.use(express.static('/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/lobby.html')
})

io.on('connection', function (socket) {
    if(number_of_sockets === 0){
        document.getElementById('playerOne').className = socket.id
    }
    else if(number_of_sockets === 1){
        document.getElementById('playerTwo').className = socket.id
    }
    else if(number_of_sockets === 2){
        document.getElementById('playerThree').className = socket.id
    }
    else if(number_of_sockets === 3){
        document.getElementById('playerFour').className = socket.id
    }
    number_of_sockets += 1
})

let blueBox = document.getElementById("blueBox")
blueBox.onclick(this.chooseBlue())

function chooseBlue() {

}