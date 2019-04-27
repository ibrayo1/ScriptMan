import { Account } from "./account"
import express = require('express')
var app = express()
var server = require('http').Server(app)
export var io = require('socket.io').listen(server)
export var playersPlayerRankHash = {}
export var playerUsernameHash = {}
export var number_of_sockets = 0
import path = require('path')

enum PlayerNumber {
    PlayerOne,
    PlayerTwo,
    PlayerThree,
    PlayerFour
}
var public_path = path.resolve('.')
app.use(express.static(public_path + '/public/'))

app.get('/', (req, res) => {
    var lobbyPath = path.resolve(__dirname + '../public')
    
    res.sendFile('lobby.html', {root: '.'})
})

io.on('connection', function (socket) {
    if(number_of_sockets === 0){
        //document.getElementById('playerOne').className = socket.id
        playersPlayerRankHash[socket.id] = PlayerNumber.PlayerOne
        //document.getElementById('playerOne').innerText = "Player One: Connected"
    }
    else if(number_of_sockets === 1){
        //document.getElementById('playerTwo').className = socket.id
        playersPlayerRankHash[socket.id] = PlayerNumber.PlayerTwo
    }
    else if(number_of_sockets === 2){
        //document.getElementById('playerThree').className = socket.id
        playersPlayerRankHash[socket.id] = PlayerNumber.PlayerThree
    }
    else if(number_of_sockets === 3){
        //document.getElementById('playerFour').className = socket.id
        playersPlayerRankHash[socket.id] = PlayerNumber.PlayerFour
    }
    number_of_sockets += 1
})



// This will get the number of the player whose socket ID is passed
// as an argument
function getPlayerNumber(socketID): PlayerNumber {
    return playersPlayerRankHash[socketID]
}

server.listen(3000, ()=>{
    console.log(`Listening on ${server.address().port}`)
})

export function lobby_changed_username(name: string){
    io.emit('username changed', (socket) => {
        playerUsernameHash[socket.id] = name
        console.log(`Username changed to ${name}`)
    })
}