var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var { Game } = require('./game.js')

app.get('/', function(req, res) {
   res.sendFile(__dirname + '/index.html');
});

const game = new Game;

io.on('connection', function(socket) {
	game.addPlayer(socket.id)
	console.log(game)
  	const emitGameState = () => {
  		io.sockets.emit('state', game);
  	}

	emitGameState();
 
	socket.on('disconnect', function () {
		game.removePlayer(socket.id)
	});

	socket.on('damageOpponent', (damage) => {
		const opponent = game.players.find(p => p.id !== socket.id);
		opponent.hp -= damage;
		emitGameState();
	});

	socket.on('playerDraw', () => {
		game.playerDraw(socket.id)
		emitGameState();
	});


});


http.listen(3000, function() {
   console.log('listening on localhost:3000');
});