var Deck = require('./deck.js')
var Board = require('./board.js')

class Player {
	constructor(id) {
		this.id = id;
		this.target = null;
		this.name = null;
	}

	init() { 
		this.hp = 20
		this.currentMana = 1;
		this.manaPool = 1;
		this.deck = new Deck;
		this.deck.shuffle();
		this.hand = this.deck.cards.splice(0, 5);
		this.board = new Board()
		this.type = "Player";
		this.timeRemaining = 600000;

		var rand = Math.random()

		if (rand >= 0 && rand <= 0.2) { this.name = "Katrina" };
		if (rand >= 0.2 && rand <= 0.4) { this.name = "Jimmy" };
		if (rand >= 0.4 && rand <= 0.6) { this.name = "Gunther" };
		if (rand >= 0.6 && rand <= 0.8) { this.name = "Coleman" };
		if (rand >= 0.8 && rand <= 10) { this.name = "Margaret" };
	}

	draw(amount = 1) {
		for (let i  = 0; i < amount; i++) {
			if (this.deck.cards.length > 0) {
				this.hand.push(this.deck.cards.shift());
			}
		}
	}
}

module.exports = Player;
