let id = 0;

const cards = [
	{
		name: 'Urchin Slingshotter', 
		cost: 1, 
		type: 'Creature', 
		text: "", 
		power: 2, 
		toughness: 1,
		keywords: [],
		imageSrc: "http://2.bp.blogspot.com/_fsMA9Dc4tnA/S-GbvGeOkiI/AAAAAAAAADg/sjDJhE6sF7A/s320/vasily.png"
	},
	{
		name: 'Arcane Explosion', 
		cost: 1, 
		type: 'Spell', 
		text: "deal 1 damage to all enemies",
		keywords: [],
		imageSrc: "https://hearthstone.gamepedia.com/media/hearthstone.gamepedia.com/thumb/d/de/Arcane_Explosion_full.jpg/500px-Arcane_Explosion_full.jpg?version=30063a3f70632fad015cf27e27f9b5e3",
		effect: (game, caster) => {
			var opponent = game.getOpponent(caster.id);
			opponent.board.attack && game.damageCreature(opponent.board.attack, 1, {name: 'Arcane Explosion', type: 'Spell'});
			opponent.board.defend && game.damageCreature(opponent.board.defend, 1, {name: 'Arcane Explosion', type: 'Spell'});
			opponent.board.support && game.damageCreature(opponent.board.support, 1, {name: 'Arcane Explosion', type: 'Spell'});
			game.damagePlayer(opponent.id, 1, {name: "Arcane Explosion", type: "Spell"});
		}
	},
	{
		name: 'Rabid Troll', 
		cost: 2, 
		type: 'Creature', 
		text: "", 
		power: 3, 
		toughness: 2,
		keywords: [],
		imageSrc: "http://cdn.shopify.com/s/files/1/1058/6186/products/Painted_TrollwithHammer_grande.jpg?v=1467922553"
	},
	{
		name: 'Obese Horror', 
		cost: 2, 
		type: 'Creature', 
		text: "", 
		power: 1, 
		toughness: 7,
		keywords: [],
		imageSrc: "http://jdillustration.jimmsdesign.co.uk/images/full-scale-image/monster-fat-horror.jpg"
	},
	{
		name: 'Noob Mage', 
		cost: 2, 
		type: 'Creature', 
		text: "whenever your opponent draws a card they take 2 damag", 
		power: 1, 
		toughness: 1,
		keywords: [],
		imageSrc: "https://orig00.deviantart.net/4fe1/f/2011/343/6/a/apprentice_magician_by_dolphinboy2000-d4in0ie.jpg",
		eventListeners: [{
			text: 'whenever your opponent draws a card they take 2 damage',
			trigger: 'draw',
			callback: (game, event, listener) => {
				var opponent = game.getOpponent(listener.playerID);
				if (event.playerID === opponent.id) {
					game.damagePlayer(opponent.id, 2, {name: "Noob Mage trigger", type: "Trigger"});
				}
			}	
		}]
	},
	{
		name: 'Smoke Screen',
		cost: 2,
		type: 'Spell',
		text: "The next combat phase is skipped",
		keywords: [],
		imageSrc: "https://www.ecbc.army.mil/news/2012/images/HX-Smoke.jpg",
		effect: (game) => {
			game.nextCombatDisabled = true;
		}
	},
	{
		name: 'Cute Spiderling', 
		cost: 3, 
		type: 'Creature', 
		text: "Deathtouch",
		keywords: ["Deathtouch"],
		power: 1, 
		toughness: 1,
		imageSrc: "https://ih1.redbubble.net/image.120538650.5332/flat,800x800,075,f.jpg"
	},
	{
		name: "Arcane Menagerie",
		cost: 3,
		type: "Creature",
		power: 0,
		toughness: 5,
		keywords: [],
		imageSrc: "http://3.bp.blogspot.com/-oLKvUEgLnkE/T0QPWmhuSrI/AAAAAAAAARI/G0usK7iebWc/s1600/fantasy_art_scenery_wallpaper_ognian_bonev_02.jpg",
		text: "Draw a card whenever you play a creature",
		eventListeners: [{
			text: 'Draw a card whenever you play a creature',
			trigger: 'play',
			callback: (game, event, listener) => {
				if (event.playerID === listener.playerID) {
					game.playerDraw(event.playerID)
				}
			}	
		}]
	},
	{
		name: 'Lava Strike', 
		cost: 3, 
		type: 'Spell', 
		text: "Deal 4 damage to target enemy",
		keywords: [],
		imageSrc: "https://hearthstone.gamepedia.com/media/hearthstone.gamepedia.com/thumb/c/cf/Lava_Burst_full.jpg/498px-Lava_Burst_full.jpg?version=c14e366de641391b7772f3b3cc167afe",
		effect: (game, caster) => {
			if (caster.target === null) {
				var opponent = game.getOpponent(caster.id);
				game.damagePlayer(opponent.id, 4);
			} else if (caster.target.type === "Player") {
			 	game.damagePlayer(caster.target.id, 4);
			} else if (caster.target.type === "Creature") {
				game.damageCreature(caster.target, 4, {name: 'Lava Strike', type: 'Spell'})
			}		
		}
	},
	{
		name: 'Soul Drain', 
		cost: 3, 
		type: 'Spell', 
		text: "Deal 3 damage to target enemy. Gain 3 life.",
		imageSrc: "https://hearthstone.gamepedia.com/media/hearthstone.gamepedia.com/thumb/c/cf/Lava_Burst_full.jpg/498px-Lava_Burst_full.jpg?version=c14e366de641391b7772f3b3cc167afe",
		effect: (game, caster) => {
			if (caster.target === null && caster.target.type === "Player") {
				var opponent = game.getOpponent(caster.id);
				game.damagePlayer(opponent.id, 3);
			} else if (caster.target.type === "Creature") {
				game.damageCreature(caster.target, 3, {name: 'Soul Drain', type: 'Spell'})
			}

			game.damagePlayer(caster.id, -3, {name: 'Soul Drain', type: 'Spell'})
		}
	},
	{
		name: 'Prescient Vision',
		cost: 3,
		type: 'Spell',
		text: 'Draw two cards',
		keywords: [],
		imageSrc: "http://i0.kym-cdn.com/entries/icons/mobile/000/022/266/brain.jpg",
		effect: (game, caster) => {
			game.playerDraw(caster.id);
			game.playerDraw(caster.id);
		}
	},
	{
		name: 'Clone',
		cost: 2, 
		type: 'Spell',
		text: 'Put a copy of target creature in to your hand. It costs only one mana to cast.',
		keywords: [],
		imageSrc: "http://uforeview.tripod.com/cjimages/teleportation.jpg",
		effect: (game, caster) => {
			if (caster.target.type === "Creature") {
				let newCard = Object.assign({}, caster.target.origin)
				newCard.cost = 1;
				newCard.id = game.newCardID;
				caster.hand.push(newCard);
				game.newCardID = game.newCardID + 1;
			}
		}
	},
	{
		name: 'Troll Headhunter',
		cost: 3,
		power: 2,
		toughness: 1,
		type: 'Creature',
		text: 'Gains +1 / +1 when it kills a creature',
		keywords: [],
		imageSrc: "http://i.imgur.com/Ljg8f4W.png",
		eventListeners: [{
			text: 'Troll Headhunter gains +1 / +1 each time it kills a creature',
			trigger: 'death',
			callback: (game, event, listener) => {
				if (event.source.id === listener.cardID) {
					const troll = game.getCreature(listener.cardID);
					troll.power = troll.power += 1;
					troll.toughness = troll.toughness += 1;
				}
			}	
		}]
	},
	{
		name: 'Bone Mage',
		cost: 3,
		power: 2,
		toughness: 2,
		type: 'Creature',
		text: 'Whenever a creature dies deal 2 damage to your opponent',
		keywords: [],
		imageSrc: "https://vignette2.wikia.nocookie.net/dragonsdogmaquest/images/d/dd/Skeleton-sorcerer.jpg/revision/latest?cb=20140808082339",
		eventListeners: [{
			text: '',
			trigger: 'death',
			callback: (game, event, listener) => {
				const opponent = game.getOpponent(listener.playerID);
				game.damagePlayer(opponent.id, 2, {name: "Bone Mage trigger", type: "Trigger"});
			}	
		}]
	},
	{
		name: 'Bone Cannon',
		cost: 3,
		power: 1,
		toughness: 4,
		type: 'Creature',
		text: 'Whenever Bone Cannon kills a minion deal 2 damage to your opponent',
		imageSrc: "https://vignette2.wikia.nocookie.net/dragonsdogmaquest/images/d/dd/Skeleton-sorcerer.jpg/revision/latest?cb=20140808082339",
		eventListeners: [{
			text: '',
			trigger: 'death',
			callback: (game, event, listener) => {
				if (event.source.id === listener.cardID) {
					const opponent = game.getOpponent(listener.playerID);
					game.damagePlayer(opponent.id, 2, {name: "Bone Cannon trigger", type: "Trigger"});
				}
			}	
		}]
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
