const EventEmitter = require('events');

class ChatBot extends EventEmitter {

	constructor(options, dependencies) {
		super();

		this.invites = {};

		this.name = options.name;
		this.prefix = options.configuration.prefix || '!hadvar';
		this.type = options.type;

		this.configuration = options.configuration || {};
		this.configuration.dependencies = dependencies || [];
		this.configuration.trust = !this.configuration.dependencies.length;
	}

	getDependencyInviteInformation(tag) {
		if (!this.configuration.dependencies.length)
			throw new Error('Failed to retrieve dependencies for primary source of trust (none configured)');

		return new Promise((resolve, reject) => {
			this.emit('createAuthenticationRequest', this.configuration.dependencies[0], tag, (information) => {
				resolve(information);
			});
		});
	}

	refreshInformation() {
		return { name: this.name, type: this.type };
	}

	createAuthenticationRequest(targetPlatform, tag) {
		let authenticationCode = `${Math.floor(Math.random() * 10)}`;

		let invite = { type: targetPlatform, tag: tag };
		invite.timeout = setTimeout(() => {
			this.logger.log('Removing expired code:', authenticationCode);	
			delete this.invites[authenticationCode];
		}, 60 * 1000);

		this.invites[authenticationCode] = invite;
		return authenticationCode;
	}

	validateAuthenticationRequest(code) {
		let invite = this.invites[code];
		if (!invite) return;
		this.emit('validatedAuthentication', invite.type, invite.tag);

		clearTimeout(invite.timeout);
		delete this.invites[code];
	}

	onCommand(msg, command, callback) {
		let components = msg.content.split(' ');
		let prefix = components.shift();
		let inputCommand = components.shift();
		if (prefix == this.prefix && inputCommand == command) {
			callback(...components);
		}
	}
}

module.exports = ChatBot;
