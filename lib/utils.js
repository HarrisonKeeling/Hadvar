const path = require('path');
const settings = require('../settings.js');

class Logger {
	constructor() {
		this.prefix = '';
	}

	log(...args) {
		console.error(`${colors.green}DEBUG${colors.magenta}` +
				` ${Logger.getCaller()}${colors.reset}${this.prefix}`, ...args);
	}

	warn(...args) {
		console.error(`${colors.yellow}WARN${colors.magenta}` +
				` ${Logger.getCaller()}${colors.reset}${this.prefix}`, ...args);
	}
	
	error(...args) {
		console.error(`${colors.red}ERROR${colors.magenta}` +
				` ${Logger.getCaller()}${colors.reset}${this.prefix}`, ...args);
	}

	setPrefix(prefix) {
		this.prefix = prefix ? ` ${colors.magenta}(${prefix})${colors.reset}` : '';
	}

	static getCaller() {
		let caller = ((new Error().stack).split("at ")[3]).trim();
		caller = caller.split('(')[1].split(')')[0].trim();
		caller = path.relative(settings.PROJECT_DIR, caller);
		return caller;
	}
}

exports.logger = new Logger();

const colors = {
	"reset": "\x1b[0m",
	"green": "\x1b[32m",
	"magenta": "\x1b[35m",
	"red": "\x1b[31m",
	"yellow": "\x1b[33m"
}
