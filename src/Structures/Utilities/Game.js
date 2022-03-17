module.exports = class Game {

	constructor(client) {
		this.client = client;
	}

	gameOver(tributeData) {
		const tributesLeftAlive = this.tributesLeftAlive(tributeData);

		if (tributesLeftAlive.length === 2) return tributesLeftAlive[0].district === tributesLeftAlive[1].district;
		else if (tributesLeftAlive.length === 1) return true;
		else return false;
	}

	tributesLeftAlive(tributeData) {
		return tributeData.filter(tribute => tribute.alive);
	}

};
