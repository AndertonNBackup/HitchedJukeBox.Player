var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('socket.io-redis');
io.adapter(redis({ host: 'redis', port: 6379 }));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', "Player: " + msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});