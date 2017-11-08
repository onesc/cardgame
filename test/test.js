var expect = require('chai').expect
var { Game } = require('../game.js')
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
			assert.isNotOk(game.board);
		});

		it('starts game with two players', function() {
			game.addPlayer("1");
			game.addPlayer("2");
			assert.equal(game.players.length, 2);
			assert.isOk(game.phase);
			assert.isOk(game.board);
		});

		it('can add and remove players', function() {
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
			assert.equal(player.hp, 50);
			game.damagePlayer("1", 1)
			assert.equal(player.hp, 49);
		});

		it('can cycle through the phases', () => {
			assert.equal(game.phase.currentPlayer.id, "1");
			assert.equal(game.phase.step, "draw");
			game.nextPhase();
			assert.equal(game.phase.step, "first_main");
			game.nextPhase();
			assert.equal(game.phase.step, "combat");
			game.nextPhase();
			assert.equal(game.phase.step, "second_main");
			game.nextPhase();
			assert.equal(game.phase.step, "end");
			game.nextPhase();
			assert.equal(game.phase.currentPlayer.id, "2");
		})

		it('drawing adds 1 card to the players hand length', () => {
			const player = game.getPlayer("1");
			assert.equal(player.hand.length, 3);
			game.playerDraw("1");
			assert.equal(player.hand.length, 4);
		})

		it('playing cards subtracts mana and adds it to board', () => {
			const player = game.getPlayer("1");
			assert.equal(player.currentMana, 1);

			const testCard = { name: "Test Card", cost: 1, id: "12345" }
			game.playCard("1", testCard, "attack");

			assert.equal(player.currentMana, 0)
			assert.deepEqual(game.board.player1board, {
				attack: testCard, 
				defend: null,
				support: null
			});
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
			const testCard = { name: "Test Card", cost: 1, id: "12345" }
			game.playCard("1", testCard, "attack");
			game.setTarget("1", game.board.player1board.attack);

			assert.deepEqual(game.board.player1board.attack, testCard);
			assert.deepEqual(player.target, game.board.player1board.attack);

			game.killCreature("12345");
			assert.deepEqual(game.board.player1board.attack, null);
			assert.deepEqual(player.target, null);
		})
	});
});