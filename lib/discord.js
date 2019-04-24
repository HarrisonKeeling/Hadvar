const { logger } = require('./utils.js');
const { bot } = require('./discord_client.js');

class DiscordBot {
	constructor(opts) {
		logger.log('Discord Child Process Created with Options:\n', opts);
		bot.on('message', (msg) => {
			logger.log("message received: ", msg.content);
		});

		logger.log('Discord Child Process Starting');
	}
}

module.exports = DiscordBot;
