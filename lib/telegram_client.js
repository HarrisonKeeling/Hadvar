const settings = require('../settings.js');
const { logger } = require('./utils.js');

let bot;

function get_instance() {
	if (bot) return bot;

	// Bot Configuration
	//
	// Automatic enabling of cancellation of promises is deprecated.
	// https://github.com/yagop/node-telegram-bot-api/issues/319
	process.env['NTBA_FIX_319'] = 1;
	const Telegram = require('node-telegram-bot-api');
	const options = {
		polling: true
	};

	logger.log("Connecting to Telegram Services");
	bot = new Telegram(settings.tokens.telegram, options);

	bot.on('polling_error', (error) => {
		logger.error(error);
	});

	return bot;
}

exports.bot = get_instance();
// ...
