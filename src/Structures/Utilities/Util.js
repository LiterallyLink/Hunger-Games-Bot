const Event = require('../Event.js');
const { token } = require('../../../config.json');
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = class Util {

	constructor(client) {
		this.client = client;
	}

	get directory() {
		return `${path.dirname(require.main.filename)}${path.sep}`;
	}

	async sleep(ms) {
		await new Promise(resolve => setTimeout(resolve, ms));
	}

	async clearSlashCommands() {
		const clientId = '809302717843111946';
		const rest = new REST({ version: '9' }).setToken(token);
		rest.get(Routes.applicationCommands(clientId)).then(data => {
			const promises = [];
			for (const command of data) {
				const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
				promises.push(rest.delete(deleteUrl));
			}
			return Promise.all(promises);
		});
	}

	async loadSlashCommands() {
		const slashCommandArray = [];

		const commands = await glob(`${this.directory}slashcommands/**/*.js`);

		for (const commandFile of commands) {
			const command = require(commandFile);
			slashCommandArray.push(command.data.toJSON());
			this.client.slashCommands.set(command.data.name, command);
		}

		const clientID = '952362588170244157';
		const guildID = '780394213200232491';
		const rest = new REST({ version: '9' }).setToken(token);
		// await this.registerSlashCommandsGlobally(rest, slashCommandArray, clientID);
		return await this.registerSlashCommandsToGuild(rest, slashCommandArray, clientID, guildID);
	}

	async registerSlashCommandsToGuild(rest, slashCommandArray, clientID, guildID) {
		try {
			await rest.put(
				Routes.applicationGuildCommands(clientID, guildID),
				{ body: slashCommandArray }
			);
		} catch (error) {
			if (error) return console.error(error);
		}

		return console.log(`Registered ${slashCommandArray.length} local slash commands.`);
	}

	async registerSlashCommandsGlobally(rest, slashCommandArray, clientID) {
		try {
			await rest.put(Routes.applicationCommands(clientID), { body: slashCommandArray });
		} catch (error) {
			if (error) return console.error(error);
		}

		return console.log(`Registered ${slashCommandArray.length} global slash commands.`);
	}

	async loadEvents() {
		return glob(`${this.directory}events/**/*.js`).then(events => {
			for (const eventFile of events) {
				delete require.cache[eventFile];
				const { name } = path.parse(eventFile);
				const File = require(eventFile);
				const event = new File(this.client, name);
				if (!(event instanceof Event)) throw new TypeError(`Event ${name} doesn't belong in Events`);
				this.client.events.set(event.name, event);
				event.emitter[event.type](name, (...args) => event.run(...args));
			}
		});
	}

};
