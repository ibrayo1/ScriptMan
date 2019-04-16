let express = require('express')
let http = require('http')
let path = require('path')
let socketIO = require('socket.io')
let app = express()
let server = http.Server(app)
let io = socketIO(server)
var players = {}

app.use(express.static(__dirname + '/lib'))
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
})
server.listen(8080, ()=>{
    console.log(`Listening on ${server.address().port}`)
})
