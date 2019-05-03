const EventEmitter = require('events');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('hadvar.db');
db.get("PRAGMA foreign_keys = ON");

const { logger } = require('./utils.js');

db.serialize(() => {
		db.run(
				'CREATE TABLE IF NOT EXISTS identities (' +
					' discord TEXT UNIQUE, telegram TEXT UNIQUE,'+
					' FOREIGN KEY (discord) REFERENCES discord(id),' +
					' FOREIGN KEY (telegram) REFERENCES telegram(id))'
				);
		});

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

	validateAuthenticationRequest(code, linkedIdentity) {
		let invite = this.invites[code];
		if (!invite) return;
		this.logger.log(linkedIdentity);
		db.serialize(() => {
				let statement = db.prepare(`INSERT OR IGNORE INTO ${this.type} (${Object.keys(linkedIdentity).join(',')}) values (?)`);
				statement.run(...Object.keys(linkedIdentity).map(key => linkedIdentity[key]));
				statement.finalize(() => {
						this.emit('validatedAuthentication', invite.type, invite.tag, linkedIdentity.id);
						});
				});

		clearTimeout(invite.timeout);
		delete this.invites[code];
	}

	validatedAuthentication(platform, tag, linkedIdentity) {
		return new Promise((resolve, reject) => {
				db.serialize(() => {
						/** If there exists a row that includes everything other than the columns
						 * of the identity we're adding, delete it and merge it... otherwise
						 * throw error
						 */

						// fetch any existing linked identities
						db.all(`SELECT * FROM identities where ${platform}=? OR ${this.type}=?`
								, [linkedIdentity, tag], (err, rows) => {
								this.logger.log(rows);	
								// reduce the linked identities, throwing an error if any keys are non-null in any two
								let merged = {};
								for (let row of rows) {
									for (let type in row) {
										if (!row[type]) continue;
										// if there's conflicting identities, caused by alternate accounts...
										// TODO: Reprocussions => ban user if alt was banned
										if (merged[type]) {
											return reject(new Error(`This ${this.type} account has already been linked to an identity`));
										}
										merged[type] = row[type];
									}
								}
								this.logger.log(merged);

								// if this identity has already been linked to something else
								if (merged[platform] && merged[platform] != linkedIdentity) {
								return reject(new Error(`This ${this.type} account has already been linked to a ${platform} identity`));
								}
								merged[platform] = linkedIdentity;

								// else, update the database with the merged row
								db.all(`DELETE FROM identities where ${platform}=? OR ${this.type}=?`
								, [linkedIdentity, tag], (err) => {
								db.all(`INSERT INTO identities (${Object.keys(merged).join(',')})` +
										` VALUES (${Object.keys(merged).map(key => merged[key]).join(',')})`,
										[], (err, result) => {
										resolve();
										});
								});
								});
				});
		});
	}

	onCommand(msg, command, callback) {
		let components = msg.split(' ');
		let prefix = components.shift();
		let inputCommand = components.shift();
		if (prefix == this.prefix && inputCommand == command) {
			callback(...components);
		}
	}
}

module.exports = ChatBot;
module.exports.db = db;
