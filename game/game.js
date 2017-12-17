var Player = require('./player.js')

let id = 0;

class Game {
	constructor() {
		this.players = [];
		this.eventListeners = []; 
		this.log = [];
		this.nextCombatDisabled = false;
		this.newCardID = 1000;
		this.id = id;
		id = id + 1;
	}

	broadcastEvent(event) { // TEST THIS
		this.eventListeners.forEach(listener => {
			if (listener.trigger === event.name) {
				listener.callback(this, event, listener);
			}
		})
	}

	addPlayer(id)  {
		this.players.push(new Player(id));
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
			this.players[0].target = this.players[1];
			this.players[1].target = this.players[0];

			this.phase = "first_main"
			this.currentPlayer = this.players[0];
			this.log = ["Welcome to the realm"];


			if (this.players[0].name === this.players[1].name) {
				this.players[1].name = this.players[1].name + " The Second"
			}

			this.gameTimer = setInterval(() => {
				this.currentPlayer.timeRemaining -= 1000;
				if (this.currentPlayer.timeRemaining <= 0) { this.log.push(this.currentPlayer.name + " is out of time!")}
			}, 1000)
		}
	}

	removePlayer(id) {
		this.players = this.players.filter(p => p.id !== id);
	}

	playCard(playerID, cardID, pos, targets = []) {
		const player = this.getPlayer(playerID);
		const card = player.hand.find(c => c.id === cardID);
		if (card.cost > player.currentMana) { return }

		player.currentMana -= card.cost;

		this.log.push(`${player.name} casts a ${card.name} ${ pos ? " in the " + pos +  " position" : ""}`);
		this.broadcastEvent({name: 'play', playerID: playerID});

		if (card.type === "Creature") {
			player.board[pos] = card;
			player.board[pos].origin = Object.assign({}, card);

			if (card.eventListeners) {
				const listeners = card.eventListeners.map(l => {
					return {...l, cardID: cardID, playerID: playerID}
				})
				this.eventListeners = this.eventListeners.concat(listeners) 
			};
		}


		if (card.type === "Spell") {
			card.effect(this, player, targets);
		}
		
		player.hand = player.hand.filter(c => c.id !== cardID);
	}

	damagePlayer(playerID, damage, source) {
		const player = this.getPlayer(playerID);
		player.hp -= damage;
		this.log.push(`${source.name} deals ${damage} damage to ${player.name}`);
	}

	getCreature(creatureID) {
		return this.players[0].board.getCreature(creatureID) || this.players[1].board.getCreature(creatureID);
	}

	getCreaturesOwner(creatureID) {
		if (this.players[0].board.getCreature(creatureID)) { 
			return this.players[0];
		} else if (this.players[1].board.getCreature(creatureID)) {
			return this.players[1];
		} else {
			console.error("Could not find player for creature with id " + creatureID);
		}
	}

	untargetCreature(creatureID) {
		if (this.players[0].target && this.players[0].target.id === creatureID) {this.players[0].target = this.players[1]};
		if (this.players[1].target && this.players[1].target.id === creatureID) {this.players[1].target = this.players[0]};
	}

	bounceCreature(creatureID) {
		const player = this.getCreaturesOwner(creatureID);
		const creature = this.getCreature(creatureID);
		player.hand.push(Object.assign({}, creature.origin));
		player.board.removeCreature(creatureID);
		this.untargetCreature(creatureID);
		this.log.push(`${creature.name} was returned to ${player.name}s hand`);
	}

	damageCreature(creature, damage, source) {
		creature.toughness -= damage;
		this.log.push(`${source.name} deals ${damage} damage to ${creature.name}`);

		if (creature.toughness <= 0) { 
			this.killCreature(creature, source);
		}
	}

	killCreature(creature, source) {
		this.log.push(`${creature.name} died`);
		this.players[0].board.removeCreature(creature.id); 
		this.players[1].board.removeCreature(creature.id);
		this.untargetCreature(creature.id);
		this.eventListeners = this.eventListeners.filter(l => l.cardID !== creature.id);
		this.broadcastEvent({name: "death", creature: creature, source: source});	
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

	creatureAttack(attackingCreature, defendingCreature) {
		const supportBuff = (this.currentPlayer.board.defend  
							&& this.currentPlayer.board.defend.id === attackingCreature.id 
							&& this.currentPlayer.board.support) ? 
							this.currentPlayer.board.support.power : 0;

		this.damageCreature(defendingCreature, attackingCreature.power + supportBuff, attackingCreature);

		if (attackingCreature.keywords.includes("Deathtouch") && defendingCreature.toughness > 0) { 
			this.killCreature(defendingCreature, attackingCreature)	
		}
	}

	combat() { 
		if (this.nextCombatDisabled === true) {
			this.nextCombatDisabled = false;
			this.log.push(`${this.currentPlayer.name}'s' combat phase has been skipped`)
			return;
		}

		const attacker = this.currentPlayer;
		const atkBoard = attacker.board;
		const defender = this.getOpponent(attacker.id);
		const defBoard = defender.board;

		if (atkBoard.attack) {
			if (attacker.target === null || attacker.target.type === "Player") {
				this.damagePlayer(defender.id, atkBoard.attack.power, atkBoard.attack);
			} else if (attacker.target.type === "Creature") {
				this.creatureAttack(atkBoard.attack, attacker.target)

				if (attacker.target !== null && attacker.target.type !== "Player") { // if creature didnt die after combat
					this.creatureAttack(attacker.target, atkBoard.attack); // return the attack
				}
			}
		}

		if (atkBoard.defend) {
			if (defBoard.defend) {
				const defendingCreature = defBoard.defend;
				this.creatureAttack(atkBoard.defend, defBoard.defend);
				this.creatureAttack(defendingCreature, atkBoard.defend);
			} else {
				const supportBuff = atkBoard.support !== null ? atkBoard.support.power : 0; 
				this.damagePlayer(defender.id, atkBoard.defend.power + supportBuff, atkBoard.defend);
			}
		}
	}

}

exports.Game = Game;
