var Player = require('./player.js')

class Game {
	constructor() {
		this.players = [];
		this.eventListeners = []; 
		this.log = [];
	}

	broadcastEvent(event) { // TEST THIS
		this.eventListeners.forEach(listener => {
			if (listener.trigger === event.name) {
				listener.callback(this, event, listener.playerID);
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
			this.players[0].init();
			this.players[1].init();
			this.phase = "first_main"
			this.currentPlayer = this.players[0];
			this.log = ["Welcome to the realm"];

			if (this.players[0].name === this.players[1].name) {
				this.players[1].name = this.players[1].name + " The Second"
			}
		}
	}

	removePlayer(id) {
		this.players = this.players.filter(p => p.id !== id);
	}

	playCard(playerID, cardID, pos) {
		const player = this.getPlayer(playerID);
		const card = player.hand.find(c => c.id === cardID);

		player.currentMana -= card.cost;

		this.log.push(`${player.name} casts a ${card.name} ${ pos ? " in the " + pos +  " position" : ""}`);

		if (card.type === "Creature") {
			player.board[pos] = card;
			if (card.eventListeners) {
				const listeners = card.eventListeners.map(l => {
					return {...l, cardID: cardID, playerID: playerID};
				})
				this.eventListeners = this.eventListeners.concat(listeners) 
			};
		}


		if (card.type === "Spell") {
			card.effect(this, player);
		}
		
		player.hand = player.hand.filter(c => c.id !== cardID);

		this.broadcastEvent({name: 'play', playerID: playerID});
	}

	damagePlayer(playerID, damage) {
		const player = this.getPlayer(playerID);
		player.hp -= damage;
	}

	damageCreature(creature, damage) {
		creature.toughness -= damage;
		this.log.push(`${creature.name} takes ${damage} damage`);

		if (creature.toughness <= 0) { 
			this.killCreature(creature);
		}
	}

	killCreature(creature) {
		this.log.push(`${creature.name} died`);
		this.players[0].board.removeCreature(creature.id); 
		this.players[1].board.removeCreature(creature.id);
		if (this.players[0].target && this.players[0].target.id === creature.id) {this.players[0].target = null};
		if (this.players[1].target && this.players[1].target.id === creature.id) {this.players[1].target = null};
		this.eventListeners = this.eventListeners.filter(l => l.cardID !== creature.id);	
	}

	setTarget(playerID, target) {
		const player = this.getPlayer(playerID);
		const realTarget = target.type === "Creature" ? this.players[0].board.getCreature(target.id) || this.players[1].board.getCreature(target.id) : this.getPlayer(target.id);
		player.target = realTarget;
	}

	playerDraw(playerID) {
		const player = this.getPlayer(playerID);
		player.draw();
		this.log.push(`${player.name} draws a card`);
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
				this.damageCreature(attacker.target, atkBoard.attack.power)

				if (attacker.target !== null) { // if creature didnt die after combat
					this.damageCreature(atkBoard.attack, attacker.target.power); // return damage
				}
			}
		}

		if (atkBoard.defend) {
			const supportBuff = atkBoard.support !== null ? atkBoard.support.power : 0; 

			if (defBoard.defend) {
				const defPwr = defBoard.defend.power;
				this.damageCreature(defBoard.defend, atkBoard.defend.power + supportBuff);
				this.damageCreature(atkBoard.defend, defPwr);
			} else {
				this.damagePlayer(defender.id, atkBoard.defend.power + supportBuff);
			}
		}
	}

}

exports.Game = Game;