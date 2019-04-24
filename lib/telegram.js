const { logger } = require('./utils.js');
const { bot } = require('./telegram_client.js');

class TelegramBot {
	constructor(opts) {
		logger.log('Telegram Child Process Created with Options:\n', opts);
		bot.on('message', (msg) => {
			logger.log("message received: ", msg.text);
		});

		logger.log('Telegram Child Process Starting');
	}
}

module.exports = TelegramBot;
