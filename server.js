var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var { Game } = require('./game.js')

app.get('/', function(req, res) {
   res.sendFile(__dirname + '/index.html');
});

const game = new Game;

io.on('connection', function(socket) {
  	const emitGameState = () => {
  		io.sockets.emit('state', game);
  	}

	socket.on('enterPlayer', () => {
		game.addPlayer(socket.id)
		console.log(socket.id + ' has connected')
		emitGameState();
	})
 
	socket.on('disconnect', function () {
		console.log(socket.id + ' has disconnected')
		game.removePlayer(socket.id)
		emitGameState();
	});

	socket.on('playerDraw', () => {
		game.playerDraw(socket.id)
		emitGameState();
	});

	socket.on('playCard', (card) => {
		game.playCard(socket.id, card)
		emitGameState();
	});

	socket.on('nextPhase', () => {
		game.nextPhase();
		emitGameState();
	})

	emitGameState();
});


http.listen(3000, function() {
   console.log('listening on localhost:3000');
});