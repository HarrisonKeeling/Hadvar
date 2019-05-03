const { Logger, logger } = require('./utils.js');
const { Discord, bot, db, helpers } = require('./discord_client.js');
const ChatBot = require('./chatbot.js');

class DiscordBot extends ChatBot {
	constructor(options={}, dependencies) {
		super(options, dependencies);
		logger.log('Discord Child Process Created');

		this.guild = this.configuration.id;
		this.whitelistRole = this.configuration.whitelistRole;

		this.logger = new Logger();
		this.logger.setPrefix(this.name);

		bot.on('ready', () => {
				db.serialize(() => {
						db.run('BEGIN EXCLUSIVE');
						db.run(
								`CREATE TABLE IF NOT EXISTS discord_${this.guild}` +
								' (id TEXT PRIMARY KEY, username TEXT, roles TEXT' +
									', banned INTEGER DEFAULT 0, FOREIGN KEY(id) REFERENCES discord(id))'
								);
						db.run('COMMIT');
				});
				helpers.backup(this.guild);

				this.instantiateChatHooks();
				this.logger.log('Discord Child Process Starting');
				});
	}

	instantiateChatHooks() {
		bot.on('message', (msg) => {
				if (!msg.guild || msg.guild.id != this.guild) return;
				this.logger.log('message received:', msg.content, 'in guild', this.guild);

				this.onCommand(msg.content, 'verify', (code) => {
						this.logger.log('verify called with code:', code);
						this.validateAuthenticationRequest(code,
								{
									id: msg.author.id,
									username: msg.author.username
								});
						});
				});

		bot.on('guildMemberAdd', async (member) => {
				if (member.guild.id != this.guild)
				return
				if (this.configuration.trust)
				return await member.addRole(this.whitelistRole);

				this.logger.log(`Member ${member.displayName} added to ${this.name}`);

				let dependency;
				try {
				dependency = await this.getDependencyInviteInformation(member.id);
				}
				catch (err) {
				this.logger.error(err);
				return;
				}

				let welcome = new Discord.RichEmbed()
				.setTitle(`**Welcome** to *~${member.guild.name}~*\n\n`)
				.setDescription(`This community is **Protected with Hadvar** and requires ` +
						`that you join ${dependency.name} ${dependency.type} ` +
						`and validate your identity. `)
				.addField('You can join the community here', dependency.inviteLink)
				.addField('Validating your identity',
						`Once you\'ve joined, type \`!hadvar verify ${dependency.code}\` in that ${dependency.type}`)

				member.send(welcome);
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

	async refreshInformation() {
		this.logger.log('Retrieve details');
		let desiredGuild = bot.guilds.get(this.guild);
		let information = { name: desiredGuild.name };	

		let invites = await desiredGuild.fetchInvites();
		if (invites.size) {
			information.inviteLink = `https://discord.gg/${invites.values().next().value.code}`
		}

		return Object.assign(super.refreshInformation(), information);
	}

	async createAuthenticationRequest(...args) {
		this.logger.log('Create authentication request for', args);
		let information = await this.refreshInformation();
		information.code = await super.createAuthenticationRequest(...args);
		return information;
	}

	async validatedAuthentication(platform, tag, linkedIdentity) {
		this.logger.log('Received authentication confirmation for', platform, tag, linkedIdentity);

		let guild = bot.guilds.get(this.guild);
		let member = guild.members.get(tag);
		try {
			await super.validatedAuthentication(platform, tag, linkedIdentity);
		} catch (err) {
			return member.send(err.message);	
		}
		member.send('Identity validated!');

		await member.addRole(this.whitelistRole);
	}
}

module.exports = DiscordBot;
