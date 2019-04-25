const { logger } = require('./utils.js');
const { bot } = require('./discord_client.js');

class DiscordBot {
	constructor(options, dependencies) {
		this.name = options.name;
		this.configuration = options.configuration;
		this.guild = this.configuration.id;

		logger.setPrefix(this.name);

		this.instantiateChatHooks();
		logger.log('Discord Child Process Starting');
	}

	instantiateChatHooks() {
		bot.on('message', (msg) => {
			if (msg.guild && msg.guild.id != this.guild) return;

			logger.log('message received: ', msg.content);
		});

		bot.on('guildMemberAdd', (member) => {
			if (member.guild.id != this.guild) return;
			logger.log(`Member ${member.displayName} added to ${this.name}`);
		});

		bot.on('guildBanAdd', (guild, user) => {
			if (guild.id != this.guild) return;
			logger.log(`Member ${user.username} banned from ${this.name}`);
		});

		bot.on('guildBanRemove', (guild, user) => {
			if (guild.id != this.guild) return;
			logger.log(`Member ${user.username} ubanned from ${this.name}`);
		});
	}
}

module.exports = DiscordBot;
