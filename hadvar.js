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
	child.on('getInviteInformation', (source, callback) => {
		logger.log('getInviteInformation request received from', child.name, 'for', source);
		let information = sources.get(source).instance.refreshInformation();
		callback(information);
	});

	return Object.assign(source, { instance: child, dependencies: config.dependencies[source.name] });
}
