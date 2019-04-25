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
const sources = config.sources.map(source => instantiateSource(source));

function instantiateSource(source) {
	const child = new constructors[source.type](source, config.dependencies[source.name]);
	return Object.assign(source, { instance: child, dependencies: config.dependencies[source.name] });
}
