# Universal Banlist Outline

The purpose of the proposed software is to achieve a
universal way of managing multi-platform communities.

## Proposed Use Case
I want to bridge together a telegram group, telegram channel,
discord server, and affiliated minecraft server.

The Telegram group will act as the "source of trust," which
will act as the primary source for entering the community.

## How it works
Once a user joins a primary source of trust, they are able
to join additional services that rely on it.  They will use
the primary source of trust as their virtual phone number to
authenticate the other services via a two-factor authentication
system.

### Example
I will use the Telegram API to and event triggers to sync
ban lists between a database and Telegram.  Additionally,
other services such as Discord and Minecraft will sync
to this database and match linked identities and ban approiate
accounts.

*Source of Trust Configuration*
```
# Source of Trust Tree
primary:
 - telegram_group

telegram_group
 - telegram_channel
 - discord

discord
 - minecraft


# Identity Configuration
telegram_group
 - {telegram_group_identifier}

telegram_channel
 - {telegram_channel_identifier}

discord
 - {discord_server_identifier}

minecraft
 - {server_ip}

```

In this example, a user must be a member of the telegram
group to gain access to other services.  Once a member,
if they join the Discord server they will be sent a
code in the telegram group that they will need to enter
as two-factor verification.  It will then link these two
account services together as the same identity.

Once entered, they will gain access to the discord.  Now
that they have access to the discord, they will have the
ability to verify their identity on the Minecraft server
to obtain authentication to build.

At any time if someone is banned on any of the linked
services, it will automatically ban the user's linked
identities across all configured services.

Single or few sources of trust will serve as the "home" of the
community, to prevent spam on all fronts -- multiple primary
sources of members will make it hard to distinguish alternate accounts
and abuse of the permissions sytem -- but are not necessarily required.

When a user wants to authenticate with a new service,
the default two-factor option will link to the first primary
source of trust communication method, but they will be able
to verify the code on any parent linked service they specify
