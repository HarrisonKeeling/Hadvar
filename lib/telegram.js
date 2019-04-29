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

		this.instantiateChatHooks();
		this.logger.log('Telegram Child Process Starting');
	}

	instantiateChatHooks() {
		bot.on('message', (msg) => {
				if (msg.chat.id != this.chat || !msg.text) return;

				this.onCommand(msg.text, 'verify', (code) => {
						this.logger.log('verify called with code:', code);
						this.validateAuthenticationRequest(code);
						});
				});

		bot.on('new_chat_members', async (msg) => {
				if (msg.chat.id != this.chat || this.configuration.trust) return;
				msg.new_chat_members.forEach((member) => {
						this.restrictMember(member);
						this.inviteMember(msg.chat, member);
						});
				});
	}

	restrictMember(member) {
		bot.restrictChatMember(this.chat, member.id, { can_send_messages: false });
	}

	async inviteMember(chat, member) {
		let displayName = member.first_name + (member.last_name ? ` ${member.last_name}` : '');
		this.logger.log(`Member ${displayName} added to ${this.name}`);

		let dependency;
		try {
			dependency = await this.getDependencyInviteInformation(member.id);
		}
		catch (err) {
			this.logger.error(err);
			return;
		}


		let generic = `*Welcome* to _~${chat.title}~_\n\n`;
		let personalized = `*Welcome* [${displayName}](tg://user?id=${member.id}) to _~${chat.title}~_\n\n`;

		let welcome_prompt =
			`This community is *Protected with Hadvar* and requires ` +
			`that you join ${dependency.name} ${dependency.type} ` +
			`and validate your identity.\n\n` +
			`[You can join the community here](${dependency.inviteLink})\n\n` +
			`*Validating your identity*\n` +
			`Once you\'ve joined, type \`!hadvar verify ${dependency.code}\` in that ${dependency.type}`;

		try {
			await bot.sendMessage(member.id, generic+welcome_prompt, { parse_mode: 'markdown' });
		} catch (err) {
			await bot.sendMessage(this.chat, personalized+welcome_prompt, { parse_mode: 'markdown' });
		}
	}

	async refreshInformation() {
		this.logger.log('Retrieve details');
		let chat = await bot.getChat(this.chat);
		let information = { name: chat.title || `${chat.type}` }

		try {
			information.inviteLink = chat.invite_link ||
				await bot.exportChatInviteLink(this.chat);
		} catch (err) {
			this.logger.error(err);
			throw new Error('Chat must be a supergroup or channel to generate invite links');
		}

		return Object.assign(super.refreshInformation(), information);
	}

	async createAuthenticationRequest(...args) {
		this.logger.log('Create authentication request for', args);
		let information = await this.refreshInformation();
		information.code = await super.createAuthenticationRequest(...args);
		return information;
	}

	async validatedAuthentication(tag) {
		this.logger.log('Received authentication confirmation for', tag);
		await bot.restrictChatMember(this.chat, tag, { can_send_messages: true });
		try {
			await bot.sendMessage(tag, 'Identity validated!');
		} catch (err) {
			await bot.sendMessage(this.chat,
				`Thank [you](tg://user?id=${tag}) for validating your identity`,
				{ parse_mode: 'markdown' });
		}
	}
}

module.exports = TelegramBot;
