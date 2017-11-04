var expect = require('chai').expect
var { Game } = require('../game.js')
var assert = require('assert');

describe('Game', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});