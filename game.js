var Deck = require('./deck.js')

class Player {
	constructor(id) {
		this.id = id;
		this.hp = 50;
		this.mana = 10;
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
		    	this.step = "attack"
		        break;
		    case "attack":
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
		
	}
}

class Game {
	constructor() {
		this.players = [];
		this.eventListeners =  [
			{
				text: 'whenever a player draws a card they take 1 damage',
				trigger: 'draw',
				callback: (trigger) => {
					this.damagePlayer(trigger.playerID, 1);
				}	
			},
			{
				text: 'whenever a player plays a card they gain two life',
				trigger: 'play',
				callback: (trigger) => {
					this.damagePlayer(trigger.playerID, -2);
				}	
			}
		]; 
	}

	broadcastEvent(event) {
		this.eventListeners.forEach(listener => {
			if (listener.trigger === event.name) {
				listener.callback(event);
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
		}
	}

	startGame() {
		if (this.players.length === 2) {
			this.phase = new Phase(this.players[0], this.players[1]);
			this.board = new Board(this.players[0], this.players[1]);
			// this.players[0].opponent = this.players[1];
			// this.players[1].opponent = this.players[0];
		}
	}

	removePlayer(id) {
		this.players = this.players.filter(p => p.id !== id);
	}

	playCard(playerID, card, pos) {
		const player = this.getPlayer(playerID);
		player.mana -= card.cost;
		this.board.playCard(playerID, card, pos);
		player.hand = player.hand.filter(c => c.id !== card.id);
		this.broadcastEvent({name: 'play', playerID: playerID});
	}

	damagePlayer(playerID, damage) {
		const player = this.getPlayer(playerID);
		player.hp -= damage;
	}

	damageCreature(creatureID, damage) {
		const creature = this.board.getCreature(creatureID);// damage creature and then broadcast event of creature being damaged
		creature.toughness -= damage;
		if (creature.toughness <= 0) { console.log("CREATURE DIED") }
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

	combat(attackerID) {
		const attacker = this.getPlayer(attackerID);
		const atkBoard = this.board.getBoard(attackerID);
		const opponent = this.getOpponent(attackerID);
		const defBoard = this.board.getBoard(opponent.id);

		if (atkBoard.attack) {
			if (attacker.target === null || attacker.target.type === "Player") {
				this.damagePlayer(opponent.id, atkBoard.attack.power);
			} else if (attacker.target.type === "Creature") {
				this.damageCreature(attacker.target.id, atkBoard.attack.power)
			}
		}
	}
}

exports.Game = Game;