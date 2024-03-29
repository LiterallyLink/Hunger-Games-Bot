/* eslint-disable consistent-return */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { bloodbath, day, night } = require('../../default_events.json');
const { createCanvas, loadImage } = require('canvas');

const avatarSize = 150;
const halfAvatar = 75;
const avatarPaddingX = 50;
const avatarPaddingY = 230;
const avatarSpacingX = 30;
const avatarSpacingY = 130;

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
		.addUserOption(option => option.setName('tribute-24').setDescription('The twenty fourth tribute.'))
		.addUserOption(option => option.setName('tribute-25').setDescription('The twenty fifth tribute.')),
	async run({ client, application }) {
		const tributes = application.options._hoistedOptions;
		let tributeData = this.generateTributeData(tributes);
		const canvas = await this.populateCanvas(client, tributeData);

		const buttons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('proceed')
					.setLabel('Proceed')
					.setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('randomize')
					.setLabel('Randomize Tributes')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('delete')
					.setLabel('🗑️')
					.setStyle('DANGER')
			);

		const buttons2 = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('proceed')
					.setLabel('Proceed')
					.setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('delete')
					.setLabel('🗑️')
					.setStyle('DANGER')
			);

		const theReapingEmbed = new MessageEmbed()
			.setImage('attachment://tributesPage.png')
			.setColor('#5d5050');
		let theReapingMsg = await application.followUp({ embeds: [theReapingEmbed], files: [{ attachment: canvas.toBuffer(), name: 'tributesPage.png' }], components: [buttons] });

		const filter = i => {
			i.deferUpdate();
			return i.user.id === application.user.id;
		};

		let startGame = false;

		while (startGame === false) {
			const response = await theReapingMsg.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 300000 }).catch(() => false);

			if (!response || response.customId === 'delete') {
				return theReapingMsg.delete().catch();
			} else if (response.customId === 'randomize') {
				tributeData = client.game.randomizeTributeData(tributeData);
				const randomizedCanvas = await this.populateCanvas(client, tributeData);

				theReapingMsg = await application.editReply({ embeds: [theReapingEmbed], files: [{ attachment: randomizedCanvas.toBuffer(), name: 'tributesPage.png' }] });
			} else {
				startGame = true;
			}
		}

		let bloodBath = true;
		let sun = true;
		let turn = 0;
		let announcementCount = 1;

		do {
			if (!bloodBath && sun) turn++;

			const remainingTributes = client.game.tributesLeftAlive(tributeData);
			const currentEvent = bloodBath ? bloodbath : sun ? day : night;

			const deaths = [];
			const results = [];
			const embedResultsText = [];
			const avatars = [];

			this.eventTrigger(currentEvent, remainingTributes, avatars, deaths, results, embedResultsText);

			const eventText = `${bloodBath ? 'Bloodbath' : sun ? `Day ${turn}` : `Night ${turn}`}`;

			const hungerGamesEmbed = new MessageEmbed()
				.setTitle(`The Hunger Games - ${eventText}`)
				.setColor('#5d5050');

			for (let i = 0; i < results.length; i++) {
				const eventImage = await this.generateEventImage(client, eventText, results[i], avatars[i]);

				hungerGamesEmbed.setImage('attachment://currentEvent.png');
				hungerGamesEmbed.setFooter({ text: `${remainingTributes.length} Tributes Remaining...` });

				await application.followUp({ content: `${embedResultsText[i]}`, embeds: [hungerGamesEmbed], files: [{ attachment: eventImage.toBuffer(), name: 'currentEvent.png' }] });
				await client.utils.sleep(5000);
			}

			if (deaths.length) {
				const deathMessage = `${deaths.length} cannon shot${deaths.length === 1 ? '' : 's'} can be heard in the distance.`;
				const deathList = deaths.map(trib => `<@${trib.id}>`).join('\n');
				const deathImage = await this.generateFallenTributes(client, deaths, announcementCount, deathMessage);

				const deadTributesEmbed = new MessageEmbed()
					.setTitle(`The Hunger Games - Fallen Tributes`)
					.setImage('attachment://deadTributes.png')
					.setDescription(`\n${deathMessage}\n\n${deathList}`)
					.setFooter({ text: `You have 5 minutes to click proceed, or the game will continue automatically.` })
					.setColor('#5d5050');
				const deadTributeMessage = await application.followUp({ embeds: [deadTributesEmbed], files: [{ attachment: deathImage.toBuffer(), name: 'deadTributes.png' }], components: [buttons2] });

				const continueGame = await deadTributeMessage.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 300000 }).catch(() => false);

				if (continueGame.customId === 'delete') {
					return deadTributeMessage.delete().catch();
				}

				announcementCount++;
			}

			if (!bloodBath) sun = !sun;

			if (bloodBath) bloodBath = false;
		} while (client.game.gameOver(tributeData) === false);

		const tributesLeft = client.game.tributesLeftAlive(tributeData);
		const winner = tributesLeft.map(trib => `${trib.name}`).join(' and ');
		const winnerText = tributesLeft.length > 1 ? `winners are` : `winner is`;

		const winnerImage = await this.generateWinnerImage(client, tributesLeft);

		const winnerEmbed = new MessageEmbed()
			.setTitle(`The ${winnerText} ${winner} from District ${tributesLeft[0].district}!`)
			.setImage('attachment://winner.png')
			.setColor('#5d5050');
		application.followUp({ embeds: [winnerEmbed], files: [{ attachment: winnerImage.toBuffer(), name: 'winner.png' }] });
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
				district: tributes.length === 2 ? i + 1 : Math.ceil(i / 2)
			};

			tributeDataArray.push(tributeObj);
		}

		return tributeDataArray;
	},

	async populateCanvas(client, tributeData) {
		const verticalAvatarCount = Math.min(tributeData.length, 6);
		const horitzontalAvatarCount = Math.ceil(tributeData.length / 6);

		const canvasWidth = ((avatarSize + avatarSpacingX) * verticalAvatarCount) - avatarSpacingX + (avatarPaddingX * 2);
		const canvasHeight = (horitzontalAvatarCount * avatarSpacingY) + (horitzontalAvatarCount * avatarSize) - avatarSpacingY + (avatarPaddingY * 2) - 100;

		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		client.canvas.drawBackground(ctx, '#5d5050');
		this.drawHeaderText(ctx, ['The Reaping']);
		await this.generateStatusImage(ctx, tributeData, client);

		return canvas;
	},

	async generateStatusImage(ctx, tributeData, client) {
		ctx.strokeStyle = '#000000';

		let destinationX = avatarPaddingX;
		let destinationY = avatarPaddingY;

		const avatarPromises = await client.canvas.massLoadImages(tributeData);

		for (let i = 0; i < tributeData.length; i++) {
			ctx.drawImage(await avatarPromises[i], destinationX, destinationY, avatarSize, avatarSize);
			ctx.strokeRect(destinationX, destinationY, avatarSize, avatarSize);

			if (!tributeData[i].alive) client.canvas.greyScale(ctx, destinationX, destinationY, avatarSize);

			const spacingMultiplier = i % 2 === 0 ? 1 : 1.5;
			destinationX += avatarSize + (avatarSpacingX * spacingMultiplier);

			if ((i + 1) % 6 === 0) {
				destinationX = avatarPaddingX;
				destinationY += avatarSize + avatarSpacingY;
			}
		}

		this.drawTributeName(ctx, tributeData);
		this.drawAliveText(ctx, tributeData);
		this.drawDistrictText(ctx, tributeData);
	},

	async generateEventImage(client, eventText, resultsText, avatarArray) {
		const canvasHeight = 500;
		const canvas = createCanvas(1, canvasHeight);
		const ctx = canvas.getContext('2d');

		ctx.font = '35px arial';

		const canvasWidth = Math.max(ctx.measureText(resultsText).width + 100, ctx.measureText('The Hunger Games').width + 100);
		ctx.canvas.width = canvasWidth;

		client.canvas.drawBackground(ctx, '#5d5050');
		this.drawHeaderText(ctx, [resultsText, eventText]);

		ctx.strokeStyle = '#000000';
		ctx.fillStyle = '#ffffff';

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
	},

	async generateFallenTributes(client, deaths, announcementCount, deathMessage) {
		const canvasHeight = 500;

		const canvas = createCanvas(1, canvasHeight);
		const ctx = canvas.getContext('2d');

		ctx.font = 'bold 28px arial';

		const deathMessageLength = ctx.measureText(deathMessage).width + 200;
		const avatarXLength = (avatarPaddingX * 2) + (avatarSize * deaths.length) + (avatarSpacingX * (deaths.length - 1));
		const canvasWidth = Math.max(deathMessageLength, avatarXLength);

		ctx.canvas.width = canvasWidth;
		client.canvas.drawBackground(ctx, '#5d5050');
		this.drawHeaderText(ctx, [deathMessage, `Fallen Tributes ${announcementCount}`]);

		ctx.font = 'bold 20px arial';
		ctx.fillStyle = '#ffffff';
		ctx.strokeStyle = '#000000';
		ctx.textAlign = 'center';

		const avatarYPosition = (canvasHeight / 2) + 10;
		let avatarXPosition = (canvasWidth / 2) - halfAvatar;
		const textYPosition = avatarYPosition + avatarSize + 10;

		avatarXPosition -= ((avatarSpacingX / 2) + halfAvatar) * (deaths.length - 1);

		for (let i = 0; i < deaths.length; i++) {
			const tributeImage = await loadImage(deaths[i].avatar);

			ctx.drawImage(tributeImage, avatarXPosition, avatarYPosition, avatarSize, avatarSize);
			ctx.strokeRect(avatarXPosition, avatarYPosition, avatarSize, avatarSize);

			client.canvas.greyScale(ctx, avatarXPosition, avatarYPosition, avatarSize);

			const textXPosition = avatarXPosition + halfAvatar;

			ctx.fillText(`${deaths[i].name.slice(0, 10)}...`, textXPosition, textYPosition);
			ctx.fillText(`District ${deaths[i].district}`, textXPosition, textYPosition + 30);

			avatarXPosition += avatarSpacingX + avatarSize;
		}

		return canvas;
	},

	async generateWinnerImage(client, tributeData) {
		const canvasWidth = 400 * tributeData.length;
		const canvasHeight = 400;

		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		client.canvas.drawBackground(ctx, '#5d5050');

		if (tributeData.length === 1) {
			this.drawHeaderText(ctx, ['The Winner']);
		} else {
			this.drawHeaderText(ctx, ['The Winners']);
		}

		ctx.strokeStyle = '#000000';

		const avatarYPosition = canvasHeight / 2;
		let avatarXPosition = (canvasWidth / 2) - halfAvatar;
		avatarXPosition -= (avatarSpacingX + halfAvatar) * (tributeData.length - 1);

		for (let i = 0; i < tributeData.length; i++) {
			const tributeImage = await loadImage(tributeData[i].avatar);

			ctx.drawImage(tributeImage, avatarXPosition, avatarYPosition, avatarSize, avatarSize);
			ctx.strokeRect(avatarXPosition, avatarYPosition, avatarSize, avatarSize);

			avatarXPosition += avatarSpacingX + avatarSize;
		}

		return canvas;
	},

	drawTributeName(ctx, tributeArray) {
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 20px arial';
		ctx.textAlign = 'center';

		let textDestinationX = avatarPaddingX + halfAvatar;
		let textDestinationY = avatarPaddingY + avatarSize + 5;

		for (let i = 0; i < tributeArray.length; i++) {
			ctx.fillText(`${tributeArray[i].name.slice(0, 10)}...`, textDestinationX, textDestinationY);

			const spacingMultiplier = i % 2 === 0 ? 1 : 1.5;
			textDestinationX += avatarSize + (avatarSpacingX * spacingMultiplier);

			if ((i + 1) % 6 === 0) {
				textDestinationX = avatarPaddingX + halfAvatar;
				textDestinationY += avatarSize + avatarSpacingY;
			}
		}
	},

	drawAliveText(ctx, tributeArray) {
		const aliveColor = '#70ec25';
		const deceasedColor = '#fa6666';
		ctx.font = 'bold 25px arial';
		ctx.textAlign = 'center';

		let textDestinationX = avatarPaddingX + halfAvatar;
		let textDestinationY = avatarPaddingY + avatarSize + 30;

		for (let i = 0; i < tributeArray.length; i++) {
			const { alive } = tributeArray[i];
			const statusText = alive ? 'Alive' : 'Deceased';

			ctx.fillStyle = alive ? aliveColor : deceasedColor;
			ctx.fillText(statusText, textDestinationX, textDestinationY);

			const spacingMultiplier = i % 2 === 0 ? 1 : 1.5;
			textDestinationX += avatarSize + (avatarSpacingX * spacingMultiplier);

			if ((i + 1) % 6 === 0) {
				textDestinationX = avatarPaddingX + halfAvatar;
				textDestinationY += avatarSize + avatarSpacingY;
			}
		}
	},

	drawDistrictText(ctx, tributeArray) {
		ctx.font = 'bold 28px arial';
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';

		const districtCount = tributeArray.map(trib => trib.district).pop();

		let textDestinationY = avatarPaddingY - 40;
		let textDestinationX = avatarPaddingX + halfAvatar;

		if (tributeArray.length === 2) {
			ctx.fillText(`District 1`, textDestinationX, textDestinationY);
			ctx.fillText(`District 2`, textDestinationX + avatarSize + avatarSpacingX, textDestinationY);
			return;
		}

		const middleXPositionArray = [215, 590, 965];
		const centerXPositionArray = [125, 500, 875];

		let iterator = 0;

		for (let i = 0; i < districtCount; i++) {
			const isLastIteration = i === districtCount - 1;

			if (isLastIteration && tributeArray.length % 2 === 1) {
				textDestinationX = centerXPositionArray[iterator];
			} else {
				textDestinationX = middleXPositionArray[iterator];
			}

			ctx.fillText(`District ${i + 1}`, textDestinationX, textDestinationY);
			iterator++;

			if ((i + 1) % 3 === 0) {
				iterator = 0;
				textDestinationY += avatarSize + avatarSpacingY;
			}
		}
	},

	drawHeaderText(ctx, textArray) {
		const text = ['The Hunger Games', ...textArray];

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

	parseEvent(text, tributes, ID) {
		for (let i = 0; i < tributes.length; i++) {
			const idOrName = ID ? `<@${tributes[i].id}>` : tributes[i].name;
			text = text.replaceAll(`(Player${i + 1})`, `${idOrName}`);
		}

		return text;
	},

	eventTrigger(events, tributeData, avatars, deaths, results, embedResultsText) {
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
				embedResultsText.push(this.parseEvent(event.text, [tribute], true));
				avatars.push([tribute.avatar]);
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
				embedResultsText.push(this.parseEvent(event.text, currTribute, true));
				avatars.push(currTribute.map(trib => trib.avatar));
			}
		}
	}
};
