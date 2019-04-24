const settings = require('../settings.js');
const { logger } = require('./utils.js');

// Bot Configuration
const Discord = require('discord.js');
const options = {
  polling: true
};

logger.log("Connecting to Discord Services");
const bot = new Discord.Client();
bot.login(settings.tokens.discord);
logger.log(settings.tokens.discord);

exports.bot = bot;
// ...
