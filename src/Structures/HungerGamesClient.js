const { Client, Collection, Intents } = require('discord.js');
const Canvas = require('./Utilities/Canvas.js');
const Game = require('./Utilities/Game.js');
const Util = require('./Utilities/Util.js');

module.exports = class HungerGamesClient extends Client {

	constructor(options = {}) {
		super({
			intents: new Intents(1539),
			allowedMentions: {
				parse: ['users']
			}
		});

		this.validate(options);

		this.slashCommands = new Collection();
		this.events = new Collection();

		this.utils = new Util(this);
		this.game = new Game(this);
		this.canvas = new Canvas(this);
	}

	validate(options) {
		if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');

		if (!options.token) throw new Error('You must pass the token for the client.');
		this.token = options.token;
	}

	async start(token = this.token) {
		await this.utils.loadSlashCommands();
		this.utils.loadEvents();

		await super.login(token);
	}

};
