const settings = require('../settings.js');
const { logger } = require('./utils.js');

process.env['NTBA_FIX_319'] = 1;
const Telegram = require('node-telegram-bot-api');
const options = {
	polling: true
};

logger.log("Connecting to Telegram Services");
const bot = new Telegram(settings.tokens.telegram, options);

bot.on('polling_error', (error) => {
	logger.error(error);
});


exports.bot = bot;
// ...
