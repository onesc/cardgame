var Deck = require('./deck.js')

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

class Board {
	constructor() {
		this.attack = null;
		this.defend = null;
		this.support = null;
	}

	getCreature(creatureID) {
		if (this.attack && creatureID === this.attack.id) { return this.attack }
		if (this.defend && creatureID === this.defend.id) { return this.defend }
		if (this.support && creatureID === this.support.id) { return this.support }
		return null;
	}

	removeCreature(creatureID) {
		if (this.attack && creatureID === this.attack.id) { this.attack = null }
		if (this.defend && creatureID === this.defend.id) { this.defend = null }
		if (this.support && creatureID === this.support.id) { this.support = null }
	}
}

class Game {
	constructor() {
		this.players = [];
		this.eventListeners = []; 
	}

	broadcastEvent(event) { // TEST THIS
		this.eventListeners.forEach(listener => {
			if (listener.trigger === event.name) {
				listener.callback(this, event);
			}
		})
	}

	addPlayer(id)  {
		this.players.push(new Player(id));
		this.startGame();
	}

	getPlayer(playerID) {
		return this.players.find(p => p.id === playerID);
	}

	getOpponent(playerID) {
		return this.players.find(p => p.id !== playerID);
	}

	next() {
		switch(this.phase) {
		    case "draw":
		    	this.phase = "first_main"
		        break;
		    case "first_main":
		    	this.phase = "combat"
		        break;
		    case "combat":
		    	this.phase = "second_main"
		        break;
		    case "second_main":
		    	this.phase = "end"
		        break;
		    case "end":
		    	this.phase = "draw"
		    	this.currentPlayer = this.currentPlayer.id === this.players[0].id ? this.players[1] : this.players[0];
		        break;
		    default:
		        return;
		}
	}

	nextPhase() {
		this.next()
		if (this.phase === "draw") {
			this.playerDraw(this.currentPlayer.id);
			this.currentPlayer.manaPool += 1;
			this.currentPlayer.currentMana = this.currentPlayer.manaPool;
			this.nextPhase();
		}

		if (this.phase === "combat") {
			this.combat();
			this.nextPhase();
		}
	}

	startGame() {
		if (this.players.length === 2) {
			this.phase = "first_main"
			this.currentPlayer = this.players[0];
		}
	}

	removePlayer(id) {
		this.players = this.players.filter(p => p.id !== id);
	}

	playCard(playerID, cardID, pos) {
		const player = this.getPlayer(playerID);
		const card = player.hand.find(c => c.id === cardID);

		player.currentMana -= card.cost;

		if (card.type === "Creature") {
			player.board[pos] = card;
			if (card.eventListeners) {
				const listeners = card.eventListeners.map(l => {
					return {...l, cardID: cardID, playerID: playerID};
				})
				this.eventListeners = this.eventListeners.concat(listeners) 
			};
		}
		
		player.hand = player.hand.filter(c => c.id !== cardID);
		this.broadcastEvent({name: 'play', playerID: playerID});
	}

	damagePlayer(playerID, damage) {
		const player = this.getPlayer(playerID);
		player.hp -= damage;
	}

	damageCreature(creatureID, damage) {
		const creature = this.players[0].board.getCreature(creatureID) || this.players[1].board.getCreature(creatureID);
		creature.toughness -= damage;
		if (creature.toughness <= 0) { 
			this.killCreature(creatureID);
		}
	}

	killCreature(creatureID) {
		this.players[0].board.removeCreature(creatureID); 
		this.players[1].board.removeCreature(creatureID);
		if (this.players[0].target && this.players[0].target.id === creatureID) {this.players[0].target = null};
		if (this.players[1].target && this.players[1].target.id === creatureID) {this.players[1].target = null};
		this.eventListeners = this.eventListeners.filter(l => l.cardID !== creatureID);
	}

	setTarget(playerID, target) {
		const player = this.getPlayer(playerID);
		player.target = target;
	}

	playerDraw(playerID) {
		const player = this.getPlayer(playerID);
		player.draw();
		this.broadcastEvent({name: "draw", playerID: playerID});
	}

	combat() { // TEST THIS.. EVENTUALLY
		const attacker = this.currentPlayer;
		const atkBoard = attacker.board;
		const defender = this.getOpponent(attacker.id);
		const defBoard = defender.board;

		if (atkBoard.attack) {
			if (attacker.target === null || attacker.target.type === "Player") {
				this.damagePlayer(defender.id, atkBoard.attack.power);
			} else if (attacker.target.type === "Creature") {
				this.damageCreature(attacker.target.id, atkBoard.attack.power)

				if (attacker.target !== null) { // if creature didnt die after combat
					this.damageCreature(atkBoard.attack.id, attacker.target.power); // return damage
				}
			}
		}

		if (atkBoard.defend) {
			const supportBuff = atkBoard.support !== null ? atkBoard.support.power : 0; 

			if (defBoard.defend) {
				const defPwr = defBoard.defend.power;
				this.damageCreature(defBoard.defend.id, atkBoard.defend.power + supportBuff);
				this.damageCreature(atkBoard.defend.id, defPwr);
			} else {
				this.damagePlayer(defender.id, atkBoard.defend.power + supportBuff);
			}
		}
	}

}

exports.Game = Game;