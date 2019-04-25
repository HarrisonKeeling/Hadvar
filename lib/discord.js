const { Logger, logger } = require('./utils.js');
const { bot } = require('./discord_client.js');
const ChatBot = require('./chatbot.js');

class DiscordBot extends ChatBot {
	constructor(options={}, dependencies) {
		super(options, dependencies);
		logger.log('Discord Child Process Created');

		this.guild = this.configuration.id;

		this.logger = new Logger();
		this.logger.setPrefix(this.name);

		this.instantiateChatHooks();
		this.logger.log('Discord Child Process Starting');
	}

	instantiateChatHooks() {
		bot.on('message', async (msg) => {
			if (!msg.guild || msg.guild.id != this.guild) return;
			if (msg.author.id != '243520188216115206') return;

			let dependency;
			try {
				dependency = await this.getDependencyInviteInformation();
			}
			catch (err) {
				this.logger.error(err);
				return;
			}

			this.logger.log(dependency);

			let response = `**Welcome** to *~${msg.guild.name}~*\n\n`;
			response += `This community is **Protected with Hadvar** and requires`
			response += `that you join and validate your identity`


			msg.author.send(response);
			this.logger.log('message received:', msg.content, '(', msg.guild.id, ') in guild', this.guild);
		});

		bot.on('guildMemberAdd', (member) => {
			if (member.guild.id != this.guild) return;
			this.logger.log(`Member ${member.displayName} added to ${this.name}`);

			if (this.trust) return;
		});

		bot.on('guildBanAdd', (guild, user) => {
			if (guild.id != this.guild) return;
			this.logger.log(`Member ${user.username} banned from ${this.name}`);
		});

		bot.on('guildBanRemove', (guild, user) => {
			if (guild.id != this.guild) return;
			this.logger.log(`Member ${user.username} ubanned from ${this.name}`);
		});
	}
}

module.exports = DiscordBot;
