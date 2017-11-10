var Deck = require('./deck.js')

class Player {
	constructor(id) {
		this.id = id;
		this.hp = 50;
		this.currentMana = 1;
		this.manaPool = 1;
		this.deck = new Deck;
		this.deck.shuffle();
		this.hand = this.deck.cards.splice(0, 3);
		this.target = null;
		this.type = "Player";
	}

	draw(amount = 1) {
		for (let i  = 0; i < amount; i++) {
			if (this.deck.cards.length > 0) {
				this.hand.push(this.deck.cards.shift());
			}
		}
	} 
}

class Phase {
	constructor(player1, player2) {
		this.player1 = player1;
		this.player2 = player2;
		this.currentPlayer = player1;
		this.step = "draw"
	}

	next() {
		switch(this.step) {
		    case "draw":
		    	this.step = "first_main"
		        break;
		    case "first_main":
		    	this.step = "combat"
		        break;
		    case "combat":
		    	this.step = "second_main"
		        break;
		    case "second_main":
		    	this.step = "end"
		        break;
		    case "end":
		    	this.step = "draw"
		    	this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
		        break;
		    default:
		        return;
		}
	}
}

class Board {
	constructor(player1, player2) {
		this.player1 = player1; // TODO: remove these and just access through player1board 
		this.player2 = player2;
		this.player1board = {attack: null, defend: null, support: null};
		this.player2board = {attack: null, defend: null, support: null};
	}

	playCard(playerID, card, pos) {
		const board = playerID === this.player1.id ? this.player1board : this.player2board;
		board[pos] = card;
	}

	getBoard(playerID) {
		const board = playerID === this.player1.id ? this.player1board : this.player2board;
		return board;
		// TODO: do this properly
	}

	getCreature(creatureID) {
		if (this.player1board.attack && creatureID === this.player1board.attack.id) { return this.player1board.attack }
		if (this.player1board.defend && creatureID === this.player1board.defend.id) { return this.player1board.defend }
		if (this.player1board.support && creatureID === this.player1board.support.id) { return this.player1board.support }
		if (this.player2board.attack && creatureID === this.player2board.attack.id) { return this.player2board.attack }
		if (this.player2board.defend && creatureID === this.player2board.defend.id) { return this.player2board.defend }
		if (this.player2board.support && creatureID === this.player2board.support.id) { return this.player2board.support }
		return null;
	}

	removeCreature(creatureID) {
		if (this.player1board.attack && creatureID === this.player1board.attack.id) { this.player1board.attack = null }
		if (this.player1board.defend && creatureID === this.player1board.defend.id) { this.player1board.defend = null }
		if (this.player1board.support && creatureID === this.player1board.support.id) { this.player1board.support = null }
		if (this.player2board.attack && creatureID === this.player2board.attack.id) { this.player2board.attack = null }
		if (this.player2board.defend && creatureID === this.player2board.defend.id) { this.player2board.defend = null }
		if (this.player2board.support && creatureID === this.player2board.support.id) { this.player2board.support = null }
	}
}

class Game {
	constructor() {
		this.players = [];
		this.eventListeners =  [
			{
				text: 'whenever a player plays a card they gain two life',
				trigger: 'play',
				callback: (game, trigger) => {
					game.damagePlayer(trigger.playerID, -2);
				}
			}
		]; 
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

	nextPhase() {
		this.phase.next()
		if (this.phase.step === "draw") {
			this.playerDraw(this.phase.currentPlayer.id);
			this.phase.currentPlayer.manaPool += 1;
			this.phase.currentPlayer.currentMana = this.phase.currentPlayer.manaPool;
		}

		if (this.phase.step === "combat") {
			this.combat(this.phase.currentPlayer.id);
		}
	}

	startGame() {
		if (this.players.length === 2) {
			this.phase = new Phase(this.players[0], this.players[1]);
			this.board = new Board(this.players[0], this.players[1]);
		}
	}

	removePlayer(id) {
		this.players = this.players.filter(p => p.id !== id);
	}

	playCard(playerID, cardID, pos) {
		const player = this.getPlayer(playerID);
		const card = player.hand.find(c => c.id === cardID);

		player.currentMana -= card.cost;
		this.board.playCard(playerID, card, pos);
		if (card.eventListeners) { this.eventListeners = this.eventListeners.concat(card.eventListeners) };
		player.hand = player.hand.filter(c => c.id !== cardID);
		this.broadcastEvent({name: 'play', playerID: playerID});
	}

	damagePlayer(playerID, damage) {
		const player = this.getPlayer(playerID);
		player.hp -= damage;
	}

	damageCreature(creatureID, damage) {
		const creature = this.board.getCreature(creatureID);// damage creature and then broadcast event of creature being damaged
		creature.toughness -= damage;
		if (creature.toughness <= 0) { 
			this.killCreature(creatureID);
		}
	}

	killCreature(creatureID) {
		const creature = this.board.removeCreature(creatureID); 
		if (this.players[0].target && this.players[0].target.id === creatureID) {this.players[0].target = null};
		if (this.players[1].target && this.players[1].target.id === creatureID) {this.players[1].target = null};
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

	combat(attackerID) { // TEST THIS.. EVENTUALLY
		const attacker = this.getPlayer(attackerID);
		const atkBoard = this.board.getBoard(attackerID);
		const opponent = this.getOpponent(attackerID);
		const defBoard = this.board.getBoard(opponent.id);

		if (atkBoard.attack) {
			if (attacker.target === null || attacker.target.type === "Player") {
				this.damagePlayer(opponent.id, atkBoard.attack.power);
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
				this.damagePlayer(opponent.id, atkBoard.defend.power + supportBuff);
			}
		}
	}

}

exports.Game = Game;