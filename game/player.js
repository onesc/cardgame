var Deck = require('./deck.js')
var Board = require('./board.js')

class Player {
	constructor(id) {
		this.id = id;
		this.hp = 20;
		this.currentMana = 1;
		this.manaPool = 1;
		this.deck = new Deck;
		this.deck.shuffle();
		this.hand = this.deck.cards.splice(0, 3);
		this.target = null;
		this.type = "Player";
		this.board = new Board()
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
