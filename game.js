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

	draw() {
		if (this.deck.cards.length > 0) {
			this.hand.push(this.deck.cards.shift());
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
				event: (trigger) => {
					this.damagePlayer(trigger.playerID, 1);
				}	
			},
			{
				text: 'whenever a player plays a card they gain two life',
				trigger: 'play',
				event: (trigger) => {
					this.damagePlayer(trigger.playerID, -2);
				}	
			}
		]; 
	}

	triggerEvents(eventName, trigger) {
		this.eventListeners.forEach(e => {
			if (e.trigger === eventName) {
				e.event(trigger)
			}
		})
	}

	addPlayer(id)  {
		this.players.push(new Player(id));
	}

	removePlayer(id) {
		this.players = this.players.filter(p => p.id !== id)
	}

	findPlayer(playerID) {
		return this.players.find(p => p.id === playerID);
	}

	playCard(playerID, card) {
		const player = this.findPlayer(playerID);
		player.mana -= card.cost;
		this.board.push({...card, owner: player.id})
		player.hand = player.hand.filter(c => c.id !== card.id);
		this.triggerEvents('play', {playerID: playerID})

	}

	damagePlayer(playerID, damage) {
		const player = this.findPlayer(playerID)
		player.hp -= damage;
	}

	playerDraw(playerID) {
		const player = this.findPlayer(playerID);
		player.draw();
		this.triggerEvents('draw', {playerID: playerID})
	}
}

exports.Game = Game;