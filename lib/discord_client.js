const { db } = require('./chatbot.js');
const { logger } = require('./utils.js');
const settings = require('../settings.js');

db.serialize(function() {
		db.run(
				'CREATE TABLE IF NOT EXISTS discord'+
				' (id TEXT PRIMARY KEY, username TEXT)'
				);
		});

// Bot Configuration
const Discord = require('discord.js');
const options = {
polling: true
};

logger.log('Connecting to Discord Services...');

const bot = new Discord.Client();

bot.login(settings.tokens.discord);
logger.log(settings.tokens.discord);

function backup(guildId) {
	logger.log(guildId);
	db.serialize(function() {
			let desiredGuild = bot.guilds.get(guildId);
			db.run(
					`CREATE TABLE IF NOT EXISTS discord_${guildId}` +
					' (id TEXT PRIMARY KEY, username TEXT, roles TEXT' +
						', banned INTEGER DEFAULT 0, FOREIGN KEY(id) REFERENCES discord(id))'
					);

			/**
			 * I don't think it is technically necessary to refresh members
			 * since it does so on connection... but it may be when the number
			 * of members in a guild is > 250
			 */
			desiredGuild.fetchMembers().then((guild) => {
					desiredGuild.fetchBans().then((bannedUsers) => {
							let users = guild.members
							.map(guildUser => Object.assign(guildUser.user, { banned: false }))
							.concat(bannedUsers.array()
									.map(user => Object.assign(user, { banned: true })));

							let server_table = db.prepare(
									`INSERT INTO discord_${guildId} (id, roles, banned)` +
									' values($id, $roles, $banned)' +
									' ON CONFLICT(id) DO UPDATE set roles=$roles, banned=$banned'
									);
							let service = db.prepare(
									'INSERT INTO discord (id, username) values($id, $username)' +
									' ON CONFLICT(id) DO UPDATE set username=$username'
									);
							let identities = db.prepare(
									'INSERT OR IGNORE INTO identities (discord) values($id)'
									);

							users.forEach(user => {
									service.run({
											$id: user.id,
											$username: user.username,
											});
									});

							service.finalize(() => {
									users.forEach(user => {
											server_table.run({
													$id: user.id,
													$roles: user.roles || '',
													$banned: user.banned
													});
											identities.run({
													$id: user.id,
													});
											});
									server_table.finalize();
									identities.finalize();
									});
					});
			});
	});
}

module.exports = {
bot: bot,
		 db: db,
		 Discord: Discord,
		 helpers: {
				backup: backup
		 }
}
// ...
