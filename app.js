var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var { GameState } = require('./GameState.js')

app.get('/', function(req, res) {
   res.sendFile(__dirname + '/index.html');
});

const game = new GameState;

io.on('connection', function(socket) {
	game.addPlayer(socket.id)
  	console.log(game);
 
	socket.on('disconnect', function () {
		game.removePlayer(socket.id)
	});

	socket.on('damagePlayer', (playerID, damage) => {
		game.damagePlayer(playerID, damage)
		console.log(game);
	});

	socket.on('playerDraw', (playerID) => {
		game.playerDraw(playerID)
		console.log(game.players[0].hand);
	});
});

http.listen(3000, function() {
   console.log('listening on localhost:3000');
});