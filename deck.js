const card = (name, cost, type, text, power = undefined, toughness = undefined) => {
	const card = {name: name, type: type, text: text, cost: cost, power: power, toughness: toughness};	
	return card;
}

class Deck {
	constructor() {
		this.cards = [
			card('Urchin Slingshotter', 1, 'Creature', "", 2, 1),
			card('Offensive Goblin', 1, 'Creature', "", 1, 3),
			card('Rabid Troll', 2, 'Creature', "", 3, 2),
			card('Obese Horror', 2, 'Creature', "", 1, 7),
			card('Noob Mage', 2, 'Creature', 'whenever a player draws a card they take 1 damage', 1, 1),
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

module.exports = Deck;



// {
// 	text: 'whenever a player draws a card they take 1 damage',
// 	trigger: 'player_draw',
// 	event: (trigger) => {
// 		this.damagePlayer(trigger.playerID, 1);
// 	}	
// // }