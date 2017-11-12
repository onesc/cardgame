var expect = require('chai').expect
var { Game } = require('../game/game.js')
var assert = require('chai').assert;

describe('Game', function() {
	describe('initializing game', function() {
		let game;

		beforeEach(() => {
			game = new Game;
		})

		it('doesnt start game with one player', function() {
			game.addPlayer("1");
			assert.isNotOk(game.phase);
		});

		it('starts game with two players', function() {
			game.addPlayer("1");
			game.addPlayer("2");
			assert.equal(game.players.length, 2);
			assert.isOk(game.phase);
		});

		it('can add and remove players', function() {
			assert.equal(game.players.length, 0);
			game.addPlayer("1");
			assert.equal(game.players.length, 1);
			game.removePlayer("1");
			assert.equal(game.players.length, 0);
		});
	});

	describe('basic game functions', function() {
		let game;

		beforeEach(() => {
			game = new Game;
			game.addPlayer("1");
			game.addPlayer("2");
		})

		it('can fetch the opponent', () => {
			const opponent = game.getOpponent("1");
			assert.equal(opponent.id, "2");
		})

		it('can damage players', () => {
			const player = game.getPlayer("1");
			assert.equal(player.hp, 20);
			game.damagePlayer("1", 1)
			assert.equal(player.hp, 19);
		});

		it('can cycle through the phases', () => {
			assert.equal(game.currentPlayer.id, "1");
			assert.equal(game.phase, "first_main");
			game.nextPhase();
			assert.equal(game.phase, "second_main");
			game.nextPhase();
			assert.equal(game.phase, "end");
			game.nextPhase();
			assert.equal(game.currentPlayer.id, "2");
		})

		it('drawing adds 1 card to the players hand length', () => {
			const player = game.getPlayer("1");
			assert.equal(player.hand.length, 3);
			game.playerDraw("1");
			assert.equal(player.hand.length, 4);
		})

		it('playing cards subtracts mana, adds it to board and removes from hand', () => {
			const player = game.getPlayer("1");
			const testCard = { name: "Test Card", cost: 1, id: "12345", type: "Creature" }
			player.hand.push(testCard);
			assert.equal(player.currentMana, 1);

			game.playCard("1", "12345", "attack");
			assert.equal(player.currentMana, 0)
			assert.deepEqual(player.board, {
				attack: testCard, 
				defend: null,
				support: null
			});
			assert.equal(player.hand.length, 3);
		})

		it('setting target adds attribute to player', () => {
			const player = game.getPlayer("1");
			assert.equal(player.target, null);
			const opponent = game.getOpponent("1");
			game.setTarget("1", opponent);
			assert.deepEqual(player.target, opponent);
		})

		it('killing creatures clears target and board', () => {
			const player = game.getPlayer("1");
			const testCard = { name: "Test Card", cost: 1, id: "12345", type: "Creature" }
			player.hand.push(testCard);
			game.playCard("1", "12345", "attack");
			game.setTarget("1", player.board.attack);

			assert.deepEqual(player.board.attack, testCard);
			assert.deepEqual(player.target, player.board.attack);

			game.killCreature("12345");
			assert.deepEqual(player.board.attack, null);
			assert.deepEqual(player.target, null);
		})

		it('playing a creature adds its event listeners with playerID and creatureID and killing it removes it', () => {
			const player = game.getPlayer("1");

			const eventListeners = [{
				text: 'whenever a player plays a card they gain two life',
				trigger: 'play',
				callback: (game, trigger) => {
					game.damagePlayer(trigger.playerID, -2);
				}
			}];

			const testCard = { name: "Test Card", cost: 1, id: "12345", eventListeners: eventListeners, type: "Creature"};
			player.hand.push(testCard);

			assert.equal(game.eventListeners.length, 0);

			game.playCard("1", "12345", "attack");

			assert.deepEqual(game.eventListeners[0], {...eventListeners[0], cardID: "12345", playerID: "1"});

			game.killCreature("12345");

			assert.equal(game.eventListeners.length, 0);
		})
	});
});