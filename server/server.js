var app = require('express')();
var http = require('http').Server(app);
var express = require('express')
var io = require('socket.io')(http);
var { Game } = require('./game.js')

app.use(express.static('client'))
app.get('/', function(req, res) {
   res.sendFile('/client/index.html');
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
	
	socket.on('playCard', (card, pos) => {
		const player = game.getPlayer(socket.id);
		
		if (card.cost > player.currentMana) { 
			socket.emit('message', "you do not have enough mana"); 
			return;
		}

		if (game.phase.currentPlayer.id !== socket.id) { 
			socket.emit('message', "it is not your turn"); 
			return;
		}

		if (game.phase.currentPlayer.id !== socket.id || (game.phase.step !== "first_main" && game.phase.step !== "second_main")) {
			socket.emit('message', "you can only play cards in your first and second main step"); 
			return;
		}

		game.playCard(socket.id, card, pos)
		emitGameState();
	});

	socket.on('nextPhase', () => {
		if (game.phase.currentPlayer.id !== socket.id) {
			socket.emit('message', "it is not your turn");
			return;
		}

		game.nextPhase();
		emitGameState();
	})

	socket.on('setTarget', (target) => {
		game.setTarget(socket.id, target);
		emitGameState();
	})

	emitGameState();
});


http.listen(3000, function() {
   console.log('listening on localhost:3000');
});