const app = require('express')();
const http = require('http').Server(app);
const express = require('express')
const io = require('socket.io')(http);
const { Game } = require('./game/game.js')
const cj = require('circular-json');

app.use(express.static('client'))
app.get('/', function(req, res) {
   res.sendFile('/client/index.html');
});

let players = [];
let games = []

io.on('connection', function(socket) {
  	const emitGameState = (game) => {
  		if (io.sockets.connected[game.players[0].id] && io.sockets.connected[game.players[1].id]) {
  			io.sockets.connected[game.players[0].id].emit('state', cj.stringify(game));
			io.sockets.connected[game.players[1].id].emit('state', cj.stringify(game));
  		}
  	}

	socket.on('enterPlayer', () => {
		console.log(socket.id + ' has connected')
		players.push(socket.id);

		if (players.length === 2) {
			const game = new Game();
			game.addPlayer(players[0]);
			game.addPlayer(players[1])
			game.startGame()
			games.push(game)
			emitGameState(game);
			players = [];
		}

	})
 
	socket.on('disconnect', function () {
		console.log(socket.id + ' has disconnected')
		// games[0].removePlayer(socket.id)
		// emitGameState(game);
	});
	
	socket.on('playCard', (card, pos) => {
		const game = games.find(g => g.players[0].id === socket.id || g.players[1].id === socket.id);

		const player = game.getPlayer(socket.id);
		
		if (card.cost > player.currentMana) { 
			socket.emit('message', "you do not have enough mana"); 
			return;
		}

		if (game.currentPlayer.id !== socket.id) { 
			socket.emit('message', "it is not your turn"); 
			return;
		}

		if (game.currentPlayer.id !== socket.id || (game.phase !== "first_main" && game.phase !== "second_main")) {
			socket.emit('message', "you can only play cards in your first and second main step"); 
			return;
		}

		game.playCard(socket.id, card, pos)
		emitGameState(game);
	});

	socket.on('nextPhase', () => {
		const game = games.find(g => g.players[0].id === socket.id || g.players[1].id === socket.id);

		if (game.currentPlayer.id !== socket.id) {
			socket.emit('message', "it is not your turn");
			return;
		}

		game.nextPhase();
		emitGameState(game);
	})

	socket.on('setTarget', (target) => {
		const game = games.find(g => g.players[0].id === socket.id || g.players[1].id === socket.id);

		game.setTarget(socket.id, target);
		emitGameState(game);
	})

	// emitGameState(game);
});


http.listen(3000, function() {
   console.log('listening on localhost:3000');
});