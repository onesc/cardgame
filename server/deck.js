let id = 0;

const cards = [
	{
		name: 'Urchin Slingshotter', 
		cost: 1, 
		type: 'Creature', 
		text: "", 
		power: 2, 
		toughness: 1,
		imageSrc: "http://2.bp.blogspot.com/_fsMA9Dc4tnA/S-GbvGeOkiI/AAAAAAAAADg/sjDJhE6sF7A/s320/vasily.png"
	},
	{
		name: 'Rabid Troll', 
		cost: 2, 
		type: 'Creature', 
		text: "", 
		power: 3, 
		toughness: 2,
		imageSrc: "http://cdn.shopify.com/s/files/1/1058/6186/products/Painted_TrollwithHammer_grande.jpg?v=1467922553"
	},
	{
		name: 'Obese Horror', 
		cost: 2, 
		type: 'Creature', 
		text: "", 
		power: 1, 
		toughness: 7,
		imageSrc: "http://jdillustration.jimmsdesign.co.uk/images/full-scale-image/monster-fat-horror.jpg"
	},
	{
		name: 'Noob Mage', 
		cost: 2, 
		type: 'Creature', 
		text: "whenever a player draws a card they take 1 damage", 
		power: 1, 
		toughness: 1,
		imageSrc: "https://orig00.deviantart.net/4fe1/f/2011/343/6/a/apprentice_magician_by_dolphinboy2000-d4in0ie.jpg",
		eventListeners: [{
			text: 'whenever a player draws a card they take 1 damage',
			trigger: 'draw',
			callback: (game, trigger) => {
				game.damagePlayer(trigger.playerID, 1);
			}	
		}]
	},
	{
		name: 'Arcane Explosion', 
		cost: 1, 
		type: 'Spell', 
		text: "deal 1 damage to all enemies",
		imageSrc: "https://hearthstone.gamepedia.com/media/hearthstone.gamepedia.com/thumb/d/de/Arcane_Explosion_full.jpg/500px-Arcane_Explosion_full.jpg?version=30063a3f70632fad015cf27e27f9b5e3"
	},
	{
		name: 'Cute Spiderling', 
		cost: 3, 
		type: 'Creature', 
		text: "Deathtouch", 
		power: 1, 
		toughness: 1,
		imageSrc: "https://ih1.redbubble.net/image.120538650.5332/flat,800x800,075,f.jpg"
	},
	{
		name: 'Lava Strike', 
		cost: 3, 
		type: 'Spell', 
		text: "Deal 4 damage to target enemy",
		imageSrc: "https://hearthstone.gamepedia.com/media/hearthstone.gamepedia.com/thumb/c/cf/Lava_Burst_full.jpg/498px-Lava_Burst_full.jpg?version=c14e366de641391b7772f3b3cc167afe"
	}
]

const card = (data) => {
	const card = {...data}
	card.id = id;
	id += 1;
	return card;
}

class Deck {
	constructor() {
		this.cards = cards.map(c => card(c));
	}

	shuffle() {
	   	for (var i = this.cards.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
	    }
	} 
}

module.exports = Deck;
