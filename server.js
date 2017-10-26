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

	emitGameState();

	socket.on('enterPlayer', () => {
		game.addPlayer(socket.id)
		emitGameState();
		console.log(game)
	})
 
	socket.on('disconnect', function () {
		console.log(socket.id + ' has disconnected')
		game.removePlayer(socket.id)
	});

	socket.on('damageOpponent', (damage) => {
		const opponent = game.players.find(p => p.id !== socket.id);
		if (opponent) opponent.hp -= damage;
		emitGameState();
	});

	socket.on('playerDraw', () => {
		game.playerDraw(socket.id)
		game.triggerEvents('player_draw', {playerID: socket.id})
		console.log(game.players[0].hand)
		emitGameState();
	});

	socket.on('endTurn', () => {
		
		game.triggerEvents('player_draw', {playerID: socket.id})
		console.log(game.players[0].hand)
		emitGameState();
	});
});


http.listen(3000, function() {
   console.log('listening on localhost:3000');
});