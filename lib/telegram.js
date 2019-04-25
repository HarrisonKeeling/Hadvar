const { Logger, logger } = require('./utils.js');
const { bot } = require('./telegram_client.js');
const EventEmitter = require('events');

class TelegramBot extends EventEmitter {
	constructor(options, dependencies) {
		super();
		logger.log('Telegram Child Process Created');

		this.logger = new Logger();
		this.logger.setPrefix(options.name);
		bot.on('message', (msg) => {
			logger.log("message received: ", msg.text);
		});

		this.logger.log('Telegram Child Process Starting');
	}
}

module.exports = TelegramBot;
