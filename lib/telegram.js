const { Logger, logger } = require('./utils.js');
const { bot } = require('./telegram_client.js');
const ChatBot = require('./chatbot.js');

class TelegramBot extends ChatBot {
	constructor(options, dependencies) {
		super(options, dependencies);
		logger.log('Telegram Child Process Created');

		this.chat = this.configuration.id;

		this.logger = new Logger();
		this.logger.setPrefix(options.name);
		bot.on('message', (msg) => {
			//logger.log('message received: ', msg.text);
		});

		this.logger.log('Telegram Child Process Starting');
	}

	async refreshInformation() {
		this.logger.log('Retrieve details');
		let information = await bot.getChat(this.chat);
		return Object.assign(super.refreshInformation(), information);
	}
}

module.exports = TelegramBot;
