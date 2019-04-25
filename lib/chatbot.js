const EventEmitter = require('events');

class ChatBot extends EventEmitter {
	constructor(options, dependencies) {
		super();

		this.name = options.name;
		this.configuration = options.configuration || {};
		this.configuration.dependencies = dependencies || [];
		this.configuration.trust = !this.configuration.dependencies.length;
	}

	getDependencyInviteInformation () {
		if (!this.configuration.dependencies.length)
			throw new Error('Failed to retrieve dependencies for primary source of trust (none configured)');

		return new Promise((resolve, reject) => {
			this.emit('getInviteInformation', this.configuration.dependencies[0], (information) => {
				resolve(information);
			});
		});
	}

	refreshInformation() {
		return { name: this.name };
	}
}

module.exports = ChatBot;
