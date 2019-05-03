const { fork } = require('child_process');
const fs = require('fs');
const { logger } = require('./lib/utils.js');

const TelegramBot = require('./lib/telegram.js');
const DiscordBot = require('./lib/discord.js');

// Read in the source configurations
// TODO: Validation
const config = JSON.parse(fs.readFileSync('config.json'));

const constructors = {
	telegram: TelegramBot,
	discord: DiscordBot
};

// Each connected source is a child process
const sources = new Map(config.sources.map(source => [source.name, instantiateSource(source)]));

function instantiateSource(source) {
	const child = new constructors[source.type](source, config.dependencies[source.name]);
	child.on('createAuthenticationRequest', (target, tag, callback) => {
		logger.log('createAuthenticationRequest for', target);
		let information = sources.get(target).instance.createAuthenticationRequest(child.name, tag);
		callback(information);
	});

	child.on('validatedAuthentication', (target, tag, linkedIdentity) => {
		logger.log('validatedAuthentication for', target, `(tag: ${tag})`);
		sources.get(target).instance.validatedAuthentication(source.type, tag, linkedIdentity);
	});

	return Object.assign(source, { instance: child, dependencies: config.dependencies[source.name] });
}
