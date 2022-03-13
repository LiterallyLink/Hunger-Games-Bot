const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

const backGroundColor = '#5d5050';
const avatarSize = 150;
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
	async run({ application }) {
		const tributes = application.options._hoistedOptions;
		const tributeData = this.generateTributeData(tributes);
		const canvas = await this.populateCanvas(tributeData);

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
			.setColor(backGroundColor);
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

	async populateCanvas(tributeData) {
		const verticalAvatarCount = Math.min(tributeData.length, 6);
		const horitzontalAvatarCount = Math.ceil(tributeData.length / 6);

		const canvasWidth = (avatarPaddingX * 2) + (avatarSize * verticalAvatarCount) + (avatarSpacingX * (verticalAvatarCount - 1));
		// redo canvas height calculations later dude
		const canvasHeight = ((avatarPaddingY * 2) - 100) + (avatarSize * horitzontalAvatarCount) + (avatarSpacingY * (horitzontalAvatarCount - 1));

		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		this.drawCanvas(ctx);
		await this.generateStatusImage(ctx, tributeData);

		return canvas;
	},

	drawCanvas(ctx) {
		ctx.fillStyle = backGroundColor;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	},

	async generateStatusImage(ctx, tributeData) {
		ctx.strokeStyle = '#000000';
		let avatarDestinationX = avatarPaddingX;
		let avatarDestinationY = avatarPaddingY;

		const avatarPromises = [];

		for (let i = 0; i < tributeData.length; i++) {
			const avatar = loadImage(tributeData[i].avatar);
			avatarPromises.push(avatar);
		}

		await Promise.all(avatarPromises);

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
	},

	drawAliveText(ctx, tributeArray) {
		const aliveColor = '#70ec25';
		const deceasedColor = '#fa6666';
		ctx.font = '25px arial';

		let textDestinationX = (avatarSize / 2) + avatarPaddingX;
		let textDestinationY = avatarPaddingY + (avatarSize * 1.2);

		for (let i = 0; i < tributeArray.length; i++) {
			const { alive } = tributeArray[i];
			const statusText = alive ? 'Alive' : 'Deceased';

			ctx.textAlign = 'center';
			ctx.fillStyle = alive ? aliveColor : deceasedColor;

			ctx.fillText(statusText, textDestinationX, textDestinationY);

			textDestinationX += avatarSpacingX + avatarSize;

			if ((i + 1) % 6 === 0) {
				textDestinationX = (avatarSize / 2) + avatarPaddingX;
				textDestinationY += avatarSize + avatarSpacingY;
			}
		}
	}
};
