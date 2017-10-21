const card = (name, cost, type, text, power, toughness) => {
	const card = {name: name, type: type, text: text, cost: cost};
	
	if (type === 'Creature') {
		card.power = power;
		card.toughness = toughness;
	} 

	return card;
}

class Player {
	constructor(id) {
		this.id = id;
		this.hp = 50;
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

class Deck {
	constructor() {
		this.cards = [
			card('Urchin Slingshotter', 1, 'Creature', "", 2, 1),
			card('Offensive Goblin', 1, 'Creature', "", 1, 3),
			card('Rabid Troll', 2, 'Creature', "", 3, 2),
			card('Obese Horror', 2, 'Creature', "", 1, 7),
			card('Noob Mage', 2, 'Creature', "Deal 2 damage to a random enemy at the end of each turn", 1, 1),
			card('Arcane Explosion', 2, 'Spell', "Deal 1 damage to all enemies"),
			card('Cute Spiderling', 3, 'Spell', "Deathtouch", 1, 1),
			card('Lava Strike', 3, 'Spell', "Deal 4 damage to target enemy")
		]
	}

	shuffle() {
	   	for (var i = this.cards.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
	    }
	} 
}

class Game {
	constructor() {
		this.players = [];
	}

	addPlayer(id)  {
		this.players.push(new Player(id));
	}

	removePlayer(id) {
		this.players = this.players.filter(p => p.id !== id)
	}

	damagePlayer(playerID, damage) {
		const player = this.players.find(p => p.id === playerID);
		player.hp -= damage;
	}

	playerDraw(playerID) {
		const player = this.players.find(p => p.id === playerID);
		player.draw();
	}
}

exports.Game = Game;