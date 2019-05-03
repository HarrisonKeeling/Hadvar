const { db } = require('./chatbot.js');
const { logger } = require('./utils.js');
const settings = require('../settings.js');

db.serialize(function() {
		db.run(
				'CREATE TABLE IF NOT EXISTS telegram'+
				' (id TEXT PRIMARY KEY, username TEXT)'
				);
});

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


/** NOTE:
 * This would only backup administrators...
 * Bots are blocked from retrieving the group members... may have to change
 * libraries to exploit a user account permissions similar to how telethon
 * API does
 *
 * function backup(chatId){...}
 */

exports.bot = bot;
module.exports = {
	bot: bot,
	db: db
}
// ...
