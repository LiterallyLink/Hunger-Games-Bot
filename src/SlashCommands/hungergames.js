const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { createCanvas } = require('canvas');

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
		application.followUp({
			embeds: [theReapingEmbed],
			files: [{ attachment: canvas.toBuffer(), name: 'tributesPage.png' }],
			components: [buttons]
		});
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
				district: Math.ceil((i + 1) / 2)
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
				textDestinationX = avatarPaddingX + halfAvatar + (avatarSpacingX * i) + (avatarSize * i);
			} else if (i === districtCount - 1 && tributeArray.length % 2 === 1) {
				textDestinationX = avatarPaddingX + (avatarSpacingX * xMultiplier) + (avatarSize * xMultiplier) + halfAvatar;
			} else {
				xMultiplier += 2;
			}

			ctx.fillText(districtText, textDestinationX, textDestinationY);
			textDestinationX += (avatarSize * 2) + (avatarSpacingX * 2);

			if ((i + 1) % 3 === 0) {
				textDestinationX = initialInBetweenPosition;
				xMultiplier = 0;
				textDestinationY += avatarSize + avatarSpacingY;
			}
		}
	},

	drawHeaderText(ctx, eventText, resultsText) {
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
	}
};
