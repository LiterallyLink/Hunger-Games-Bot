const { loadImage } = require('canvas');

module.exports = class Canvas {

	constructor(client) {
		this.client = client;
	}

	drawBackground(ctx, bgColor) {
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	async massLoadImages(tributeData) {
		const avatarPromises = [];

		for (let i = 0; i < tributeData.length; i++) {
			const avatar = loadImage(tributeData[i].avatar);
			avatarPromises.push(avatar);
		}

		return await Promise.all(avatarPromises);
	}

};
