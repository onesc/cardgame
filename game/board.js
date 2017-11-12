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

module.exports = Board;