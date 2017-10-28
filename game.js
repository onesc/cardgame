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
		for (let i=0; i < amount; i++) {
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
		this.phase = "draw"
	}

	next() {
		switch(this.phase) {
		    case "draw":
		    	this.phase = "first_main"
		    	this.currentPlayer.draw();
		        break;
		    case "first_main":
		    	this.phase = "attack"
		        break;
		    case "attack":
		    	this.phase = "second_main"
		        break;
		    case "second_main":
		    	this.phase = "end"
		        break;
		    case "end":
		    	this.phase = "draw"
		    	this.turn = this.turn === this.player1 ? this.player2 : this.player1;
		        break;
		    default:
		        return;
		}
	}
}

class Game {
	constructor() {
		this.players = [];
		this.board = []
		this.turn = ''
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

	startGame() {
		if (this.players.length === 2) {
			this.phase = new Phase(this.players[0], this.players[1]);
		}
	}

	removePlayer(id) {
		this.players = this.players.filter(p => p.id !== id);
	}

	findPlayer(playerID) {
		return this.players.find(p => p.id === playerID);
	}

	playCard(playerID, card) {
		const player = this.findPlayer(playerID);
		player.mana -= card.cost;
		this.board.push({...card, owner: player.id})
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