module.exports = class Game {

	constructor(client) {
		this.client = client;
	}

	gameOver(tributeData) {
		const tributesLeftAlive = tributeData.filter(tribute => tribute.alive).length;

		if (tributesLeftAlive === 2) return tributesLeftAlive[0].district === tributesLeftAlive[1].district;
		else if (tributesLeftAlive === 1) return true;
		else return false;
	}

};
