let express = require('express')
let http = require('http')
let path = require('path')
let socketIO = require('socket.io')
let app = express()
let server = http.Server(app)
let io = socketIO(server)
var players = {}

// not sure if this is correct but oh well
app.use(express.static(__dirname + '/static/index.html'))
app.get('/', function(req: any, res: any){
    res.sendFile(__dirname + "/static/index.html") 
    console.log("Hi")
})
server.listen(8080, ()=>{
    console.log(`Listening on ${server.address().port}`)
}) 
