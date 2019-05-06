const EventEmitter = require('events');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('hadvar.db');
db.get("PRAGMA foreign_keys = ON");

const { logger } = require('./utils.js');

db.serialize(() => {
		db.run(
				'CREATE TABLE IF NOT EXISTS identities (' +
					' discord TEXT UNIQUE, telegram TEXT UNIQUE,'+
					' banned INT DEFAULT 0)'
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

		this.emit('validatedAuthentication', invite.type, invite.tag, linkedIdentity.id);
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
										if (row.banned) {
											// TODO: Reprocussions => ban user if alt was banned
											return reject(new Error('This account has been flagged as an alternate account of a banned identity'));
										}
										
										if (!row[type]) continue;
										// if there's conflicting identities, caused by alternate accounts...
										if (merged[type]) {
											return reject(new Error(`This ${this.type} account has already been linked to an identity`));
										}
										merged[type] = row[type];
									}
								}
								this.logger.log(merged);

								// if a different account has been linked to the target service
								if (merged[this.type] && merged[this.type] != tag) {
								return reject(new Error(`Another ${this.type} account has already been linked to this ${platform} identity`));
								}
								merged[this.type] = tag;

								// if this identity has already been linked to the target service
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

	banIdentity(id) {
		this.logger.log(`User ${id} banned from service ${this.type}`);
		db.serialize(() => {
			db.all(`UPDATE identities SET banned=1 WHERE ${this.type}=?`, [id], (err) => {
				db.all(`SELECT discord, telegram FROM identities WHERE ${this.type}=?`, [id], (err, result) => {
					let services = result[0];
					for (let type in services) {
						if (!services[type]) continue;
						// e.g. 'discord', '{discord user id}'
						this.emit('banIdentityFromService', type, services[type]);
					}
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
