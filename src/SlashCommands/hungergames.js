const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const hungerGamesEvents = require('../../hungerGamesEvents.json');
const { createCanvas, loadImage } = require('canvas');

const avatarSize = 150;
const halfAvatar = 75;
const avatarPaddingX = 50;
const avatarPaddingY = 200;
const avatarSpacingX = 30;
const avatarSpacingY = 100;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hunger-games')
		.setDescription('Prepares a game of hunger games.')
		.addUserOption(option => option.setName('tribute-1').setDescription('The first tribute.').setRequired(true))
		.addUserOption(option => option.setName('tribute-2').setDescription('The second tribute.').setRequired(true))
		.addUserOption(option => option.setName('tribute-3').setDescription('The third tribute.'))
		.addUserOption(option => option.setName('tribute-4').setDescription('The fourth tribute.'))
		.addUserOption(option => option.setName('tribute-5').setDescription('The fifth tribute.'))
		.addUserOption(option => option.setName('tribute-6').setDescription('The sixth tribute.'))
		.addUserOption(option => option.setName('tribute-7').setDescription('The seventh tribute.'))
		.addUserOption(option => option.setName('tribute-8').setDescription('The eighth tribute.'))
		.addUserOption(option => option.setName('tribute-9').setDescription('The ninth tribute.'))
		.addUserOption(option => option.setName('tribute-10').setDescription('The tenth tribute.'))
		.addUserOption(option => option.setName('tribute-11').setDescription('The eleventh tribute.'))
		.addUserOption(option => option.setName('tribute-12').setDescription('The twelfth tribute.'))
		.addUserOption(option => option.setName('tribute-13').setDescription('The thirteenth tribute.'))
		.addUserOption(option => option.setName('tribute-14').setDescription('The fourteenth tribute.'))
		.addUserOption(option => option.setName('tribute-15').setDescription('The fifteenth tribute.'))
		.addUserOption(option => option.setName('tribute-16').setDescription('The sixteenth tribute.'))
		.addUserOption(option => option.setName('tribute-17').setDescription('The seventeenth tribute.'))
		.addUserOption(option => option.setName('tribute-18').setDescription('The eighteenth tribute.'))
		.addUserOption(option => option.setName('tribute-19').setDescription('The nineteenth tribute.'))
		.addUserOption(option => option.setName('tribute-20').setDescription('The twentieth tribute.'))
		.addUserOption(option => option.setName('tribute-21').setDescription('The twenty first tribute.'))
		.addUserOption(option => option.setName('tribute-22').setDescription('The twenty second tribute.'))
		.addUserOption(option => option.setName('tribute-23').setDescription('The twenty third tribute.'))
		.addUserOption(option => option.setName('tribute-24').setDescription('The twenty fourth tribute.')),
	async run({ client, application }) {
		const tributes = application.options._hoistedOptions;
		const tributeData = this.generateTributeData(tributes);
		const canvas = await this.populateCanvas(tributeData, client);

		const buttons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('start')
					.setLabel('Proceed')
					.setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('randomize-districts')
					.setLabel('Randomize Districts')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('quit')
					.setLabel('🗑️')
					.setStyle('DANGER')
			);

		const theReapingEmbed = new MessageEmbed()
			.setImage('attachment://tributesPage.png')
			.setColor('#5d5050');
		await application.followUp({
			embeds: [theReapingEmbed],
			files: [{ attachment: canvas.toBuffer(), name: 'tributesPage.png' }],
			components: [buttons]
		});

		let bloodBath = true;
		let sun = true;
		let turn = 0;
		let totalFunerals = 0;

		while (!client.game.gameOver(tributeData)) {
			if (!bloodBath && sun) turn++;

			const remainingTributes = tributeData.filter(tribute => tribute.alive);
			const currentEvent = bloodBath ? hungerGamesEvents.bloodbath : sun ? hungerGamesEvents.day : hungerGamesEvents.night;

			const deaths = [];
			const results = [];
			const mentionResults = [];
			const avatarsPerEvent = [];

			this.eventTrigger(remainingTributes, currentEvent, deaths, results, mentionResults, avatarsPerEvent);

			const eventText = `${bloodBath ? 'Bloodbath' : sun ? `Day ${turn}` : `Night ${turn}`}`;

			const hungerGamesEmbed = new MessageEmbed()
				.setTitle(`The Hunger Games - ${eventText}`)
				.setColor('#5d5050');

			for (let i = 0; i < results.length; i++) {
				const eventImage = await this.generateEventImage(client, eventText, results[i], avatarsPerEvent[i]);

				hungerGamesEmbed.setImage('attachment://currentEvent.png');
				hungerGamesEmbed.setDescription(`${mentionResults[i]}`);
				hungerGamesEmbed.setFooter({ text: `${remainingTributes.length} Tributes Remaining...` });

				await application.followUp({ embeds: [hungerGamesEmbed], files: [{ attachment: eventImage.toBuffer(), name: 'currentEvent.png' }] });
				await client.utils.sleep(5000);
			}

			if (deaths.length) {
				totalFunerals++;
				const deathMessage = `${deaths.length} cannon shot${deaths.length === 1 ? '' : 's'} can be heard in the distance.`;
				const deadTributesImage = await this.generateFallenTributes(client, deaths, totalFunerals, deathMessage);

				const deadTributesEmbed = new MessageEmbed()
					.setTitle(`The Hunger Games - Fallen Tributes`)
					.setImage('attachment://deadTributes.png')
					.setDescription(`\n${deathMessage}\n\n${deaths.map(trib => `<@${trib.id}>`).join('\n')}`)
					.setColor('#5d5050');
				await application.followUp({ embeds: [deadTributesEmbed], files: [{ attachment: deadTributesImage.toBuffer(), name: 'deadTributes.png' }] });
				await client.utils.sleep(5000);
			}

			if (!bloodBath) sun = !sun;

			if (bloodBath) bloodBath = false;
		}

		const tributesLeft = tributeData.filter(tribute => tribute.alive);
		const winnerName = tributesLeft.length > 1 ? `${tributesLeft.map(tribute => tribute.name).join(' and ')}` : `${tributesLeft[0].name}`;
		const winnerSuffix = tributesLeft.length > 1 ? 'are the winners' : 'is the winner';

		const winnerEmbed = new MessageEmbed()
			.setTitle(`${winnerName} from District ${tributesLeft[0].district} ${winnerSuffix} of the Hunger Games!`)
			.setColor('#5d5050');
		application.followUp({ embeds: [winnerEmbed] });
	},

	generateTributeData(tributes) {
		const tributeDataArray = [];

		for (let i = 0; i < tributes.length; i++) {
			const { user } = tributes[i];

			const tributeObj = {
				name: user.username,
				id: user.id,
				avatar: user.displayAvatarURL({ format: 'png' }),
				alive: true,
				kills: [],
				killedBy: '',
				district: tributes.length === 2 ? i + 1 : Math.ceil((i + 1) / 2)
			};

			tributeDataArray.push(tributeObj);
		}

		return tributeDataArray;
	},

	async populateCanvas(tributeData, client) {
		const verticalAvatarCount = Math.min(tributeData.length, 6);
		const horitzontalAvatarCount = Math.ceil(tributeData.length / 6);

		const canvasWidth = (avatarPaddingX * 2) + (avatarSize * verticalAvatarCount) + (avatarSpacingX * (verticalAvatarCount - 1));
		// redo canvas height calculations later dude
		const canvasHeight = ((avatarPaddingY * 2) - 100) + (avatarSize * horitzontalAvatarCount) + (avatarSpacingY * (horitzontalAvatarCount - 1));

		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		client.canvas.drawBackground(ctx, '#5d5050');
		this.drawHeaderText(ctx);
		await this.generateStatusImage(ctx, tributeData, client);

		return canvas;
	},

	async generateFallenTributes(client, deaths, totalFunerals, deathMessage) {
		const canvasHeight = 450;
		const canvas = createCanvas(1, canvasHeight);
		const ctx = canvas.getContext('2d');
		ctx.font = 'bold 28px arial';

		const deathMessageLength = ctx.measureText(deathMessage).width + 200;
		const avatarXLength = (avatarSize * deaths.length) + (avatarSpacingX * (deaths.length - 1)) + 100;
		const canvasWidth = Math.max(deathMessageLength, avatarXLength);

		ctx.canvas.width = canvasWidth;
		client.canvas.drawBackground(ctx, '#5d5050');
		this.drawHeaderText(ctx, deathMessage, `Fallen Tributes ${totalFunerals}`);

		const avatarYPosition = (canvasHeight / 2) + 10;
		let avatarXPosition = (canvasWidth / 2) - halfAvatar;
		avatarXPosition -= ((avatarSpacingX / 2) + halfAvatar) * (deaths.length - 1);

		for (let i = 0; i < deaths.length; i++) {
			const tributeImage = await loadImage(deaths[i].avatar);
			ctx.drawImage(tributeImage, avatarXPosition, avatarYPosition, avatarSize, avatarSize);

			const imageData = ctx.getImageData(avatarXPosition, avatarYPosition, avatarSize, avatarSize);
			const pixels = imageData.data;

			for (let j = 0; j < pixels.length; j += 4) {
				const lightness = parseInt((pixels[j] + pixels[j + 1] + pixels[j + 2]) / 3);

				pixels[j] = lightness;
				pixels[j + 1] = lightness;
				pixels[j + 2] = lightness;
			}

			ctx.putImageData(imageData, avatarXPosition, avatarYPosition);

			ctx.strokeRect(avatarXPosition, avatarYPosition, avatarSize, avatarSize);

			avatarXPosition += avatarSpacingX + avatarSize;
		}

		return canvas;
	},

	parseEvent(text, tributes, ID) {
		for (let i = 0; i < tributes.length; i++) {
			const idOrName = ID ? `<@${tributes[i].id}>` : tributes[i].name;
			text = text.replaceAll(`(Player${i + 1})`, `${idOrName}`);
		}

		return text;
	},

	// eslint-disable-next-line consistent-return
	eventTrigger(tributeData, events, deaths, results, mentionResults, avatarsPerEvent) {
		const tributes = new Set(tributeData);

		for (const tribute of tributes) {
			if (!tributes.has(tribute)) continue;

			const filteredEvents = events.filter(event => event.tributes <= tributes.size && event.deaths < tributes.size);
			const event = filteredEvents[Math.floor(Math.random() * filteredEvents.length)];

			tributes.delete(tribute);

			if (event.tributes === 1) {
				if (event.deaths.length === 1) {
					deaths.push(tribute);
					tribute.alive = false;
					tributes.delete(tribute);
				}

				results.push(this.parseEvent(event.text, [tribute], false));
				mentionResults.push(this.parseEvent(event.text, [tribute], true));
				avatarsPerEvent.push([tribute.avatar]);
			} else {
				const currTribute = [tribute];

				if (event.killers.includes(1)) tribute.kills.push(tribute);

				if (event.deaths.includes(1)) {
					deaths.push(tribute);
					tribute.alive = false;
					tributes.delete(tribute);
				}

				for (let i = 2; i <= event.tributes; i++) {
					const tributesArray = Array.from(tributes);
					const randomTribute = tributesArray[Math.floor(Math.random() * tributesArray.length)];

					if (event.killers.includes(i)) randomTribute.kills.push(randomTribute);

					if (event.deaths.includes(i)) {
						tribute.kills.push(randomTribute);
						randomTribute.alive = false;
						deaths.push(randomTribute);
						tributes.delete(randomTribute);
					}

					currTribute.push(randomTribute);
					tributes.delete(randomTribute);
				}

				results.push(this.parseEvent(event.text, currTribute));
				mentionResults.push(this.parseEvent(event.text, currTribute, true));
				avatarsPerEvent.push(currTribute.map(trib => trib.avatar));
			}
		}
	},

	async generateStatusImage(ctx, tributeData, client) {
		ctx.strokeStyle = '#000000';
		let avatarDestinationX = avatarPaddingX;
		let avatarDestinationY = avatarPaddingY;

		const avatarPromises = await client.canvas.massLoadImages(tributeData);

		for (let i = 0; i < tributeData.length; i++) {
			ctx.drawImage(await avatarPromises[i], avatarDestinationX, avatarDestinationY, avatarSize, avatarSize);

			if (!tributeData[i].alive) {
				const imageData = ctx.getImageData(avatarDestinationX, avatarDestinationY, avatarSize, avatarSize);
				const pixels = imageData.data;

				for (let j = 0; j < pixels.length; j += 4) {
					const lightness = parseInt((pixels[j] + pixels[j + 1] + pixels[j + 2]) / 3);

					pixels[j] = lightness;
					pixels[j + 1] = lightness;
					pixels[j + 2] = lightness;
				}

				ctx.putImageData(imageData, avatarDestinationX, avatarDestinationY);
			}

			ctx.strokeRect(avatarDestinationX, avatarDestinationY, avatarSize, avatarSize);

			avatarDestinationX += avatarSpacingX + avatarSize;

			if ((i + 1) % 6 === 0) {
				avatarDestinationX = 50;
				avatarDestinationY += avatarSize + avatarSpacingY;
			}
		}

		this.drawAliveText(ctx, tributeData);
		this.drawDistrictText(ctx, tributeData);
	},

	drawAliveText(ctx, tributeArray) {
		const aliveColor = '#70ec25';
		const deceasedColor = '#fa6666';
		ctx.font = '25px arial';

		let textDestinationX = halfAvatar + avatarPaddingX;
		let textDestinationY = avatarPaddingY + (avatarSize * 1.2);

		for (let i = 0; i < tributeArray.length; i++) {
			const { alive } = tributeArray[i];
			const statusText = alive ? 'Alive' : 'Deceased';

			ctx.textAlign = 'center';
			ctx.fillStyle = alive ? aliveColor : deceasedColor;

			ctx.fillText(statusText, textDestinationX, textDestinationY);

			textDestinationX += avatarSpacingX + avatarSize;

			if ((i + 1) % 6 === 0) {
				textDestinationX = halfAvatar + avatarPaddingX;
				textDestinationY += avatarSize + avatarSpacingY;
			}
		}
	},

	// optimize later, really messy lol
	drawDistrictText(ctx, tributeArray) {
		ctx.font = 'bold 28px arial';
		ctx.textBaseline = 'alphabetic';
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';

		const districtCount = Math.max(Math.ceil(tributeArray.length / 2), 2);
		const initialInBetweenPosition = avatarPaddingX + avatarSize + (avatarSpacingX / 2);
		let xMultiplier = 0;

		let textDestinationX = initialInBetweenPosition;
		let textDestinationY = avatarPaddingY - 15;

		for (let i = 0; i < districtCount; i++) {
			const districtText = `District ${i + 1}`;

			if (tributeArray.length === 2) {
				textDestinationX = avatarPaddingX + halfAvatar + ((avatarSpacingX + avatarSize) * i);
			} else if (i === districtCount - 1 && tributeArray.length % 2 === 1) {
				textDestinationX = avatarPaddingX + ((avatarSpacingX + avatarSize) * xMultiplier) + halfAvatar;
			} else {
				xMultiplier += 2;
			}

			ctx.fillText(districtText, textDestinationX, textDestinationY);
			textDestinationX += (avatarSize + avatarSpacingX) * 2;

			if ((i + 1) % 3 === 0) {
				textDestinationX = initialInBetweenPosition;
				xMultiplier = 0;
				textDestinationY += avatarSize + avatarSpacingY;
			}
		}
	},

	drawHeaderText(ctx, resultsText, eventText) {
		if (!eventText) eventText = 'The Reaping';

		const text = ['The Hunger Games', eventText];

		if (resultsText) text.push(resultsText);

		ctx.textBaseline = 'top';
		ctx.font = '35px arial';
		ctx.textAlign = 'center';

		let textPaddingY = 30;
		const ySizing = 45;

		for (let i = 0; i < text.length; i++) {
			const textMeasure = ctx.measureText(text[i]);
			const textCenterAlignment = (ctx.canvas.width / 2) - textMeasure.actualBoundingBoxLeft - 5;
			const textWidth = textMeasure.width + 10;

			ctx.fillStyle = '#232323';
			ctx.fillRect(textCenterAlignment, textPaddingY, textWidth, ySizing);

			ctx.strokeStyle = '#ffffff';
			ctx.strokeRect(textCenterAlignment, textPaddingY, textWidth, ySizing);

			ctx.fillStyle = '#e4ae24';
			ctx.fillText(text[i], ctx.canvas.width / 2, textPaddingY);
			textPaddingY += 70;
		}
	},

	async generateEventImage(client, eventText, resultsText, avatarArray) {
		const canvasHeight = 500;
		const canvas = createCanvas(1, canvasHeight);
		const ctx = canvas.getContext('2d');

		ctx.font = '35px arial';
		ctx.fillStyle = '#FFFFFF';
		const canvasWidth = ctx.measureText(resultsText).width + 100;
		ctx.canvas.width = canvasWidth;

		client.canvas.drawBackground(ctx, '#5d5050');
		this.drawHeaderText(ctx, resultsText, eventText);

		const avatarYPosition = (canvasHeight / 2) + 10;
		let avatarXPosition = (canvasWidth / 2) - halfAvatar;
		avatarXPosition -= ((avatarSpacingX / 2) + halfAvatar) * (avatarArray.length - 1);

		for (let i = 0; i < avatarArray.length; i++) {
			const tributeImage = await loadImage(avatarArray[i]);
			ctx.drawImage(tributeImage, avatarXPosition, avatarYPosition, avatarSize, avatarSize);
			ctx.strokeRect(avatarXPosition, avatarYPosition, avatarSize, avatarSize);

			avatarXPosition += avatarSpacingX + avatarSize;
		}

		return canvas;
	}
};
