const { logger } = require('./utils.js');
const { bot } = require('./telegram_client.js');

class TelegramBot {
	constructor(options, dependencies) {
		logger.log('Telegram Child Process Created');
		bot.on('message', (msg) => {
			logger.log("message received: ", msg.text);
		});

		logger.log('Telegram Child Process Starting');
	}
}

module.exports = TelegramBot;
