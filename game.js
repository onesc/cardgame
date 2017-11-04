var Deck = require('./deck.js')

class Player {
	constructor(id) {
		this.id = id;
		this.hp = 50;
		this.mana = 10;
		this.deck = new Deck;
		this.deck.shuffle();
		this.hand = this.deck.cards.splice(0, 3);
	}

	draw(amount = 1) {
		for (let i  = 0; i < amount; i++) {
			if (this.deck.cards.length > 0) {
				this.hand.push(this.deck.cards.shift());
			}
		}
	} 
}

class Phase {
	constructor(player1, player2) {
		this.player1 = player1;
		this.player2 = player2;
		this.currentPlayer = player1;
		this.step = "draw"
	}

	next() {
		switch(this.step) {
		    case "draw":
		    	this.step = "first_main"
		        break;
		    case "first_main":
		    	this.step = "attack"
		        break;
		    case "attack":
		    	this.step = "second_main"
		        break;
		    case "second_main":
		    	this.step = "end"
		        break;
		    case "end":
		    	this.step = "draw"
		    	this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
		        break;
		    default:
		        return;
		}
	}
}

class Board {
	constructor(player1, player2) {
		this.player1 = player1;
		this.player2 = player2;
		this.player1board = {attack: null, defend: null, support: null};
		this.player2board = {attack: null, defend: null, support: null};
	}

	playCard(playerID, card, pos) {
		const board = playerID === this.player1.id ? this.player1board : this.player2board;
		board[pos] = card;
	}
}

class Game {
	constructor() {
		this.players = [];
		this.board = []
		this.eventListeners =  [
			{
				text: 'whenever a player draws a card they take 1 damage',
				trigger: 'draw',
				callback: (trigger) => {
					this.damagePlayer(trigger.playerID, 1);
				}	
			},
			{
				text: 'whenever a player plays a card they gain two life',
				trigger: 'play',
				callback: (trigger) => {
					this.damagePlayer(trigger.playerID, -2);
				}	
			}
		]; 
	}

	broadcastEvent(event) {
		this.eventListeners.forEach(listener => {
			if (listener.trigger === event.name) {
				listener.callback(event);
			}
		})
	}

	addPlayer(id)  {
		this.players.push(new Player(id));
		this.startGame();
	}

	nextPhase() {
		this.phase.next()
		if (this.phase.step === "draw") {
			this.playerDraw(this.phase.currentPlayer.id);
		}
	}

	startGame() {
		if (this.players.length === 2) {
			this.phase = new Phase(this.players[0], this.players[1]);
			this.board = new Board(this.players[0], this.players[1]);
		}
	}

	removePlayer(id) {
		this.players = this.players.filter(p => p.id !== id);
	}

	findPlayer(playerID) {
		return this.players.find(p => p.id === playerID);
	}

	playCard(playerID, card, pos) {
		const player = this.findPlayer(playerID);
		player.mana -= card.cost;
		this.board.playCard(playerID, card, pos);
		player.hand = player.hand.filter(c => c.id !== card.id);
		this.broadcastEvent({name: 'play', playerID: playerID});
	}

	damagePlayer(playerID, damage) {
		const player = this.findPlayer(playerID);
		player.hp -= damage;
	}

	playerDraw(playerID) {
		const player = this.findPlayer(playerID);
		player.draw();
		this.broadcastEvent({name: "draw", playerID: playerID});
	}
}

exports.Game = Game;