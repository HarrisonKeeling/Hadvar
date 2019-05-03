# Hadvar
Hadvar is a mutliplatform chatbot tool to assist in management
of large communities via linking accounts, enforcing a dependency
of services, and banning accounts across multiple platforms.

<img src="doc/media/hadvar.png" width="150">

## How it works
A "Source of Trust" is a channel in which users are allowed to freely join;
a funnel of sorts into a community.

Once a user joins a primary source of trust, they are able to join additional
services that depend on it.

When joining another dependent service, they will use the dependency as
a virtual phone number to authenticate via a two-factor
authentication code.  By doing so, we can essentially "tie" the two services
together, without having to use services like OAuth.

## Current Development Status
**Short Term**
- [x] Cross-platform two-factor authentication (Discord & Telegram)
- [X] User identity storage
- [ ] Add automatic same-platform authentication
- [ ] Improve token generation
- [ ] Universal ban events
- [ ] Universal unban events

**Long Term**
- [ ] User backup
- [ ] Optional source of trust captcha
- [ ] Optional source of trust bad actor alternate account identification

## Installation
The project assumes you have [npm](https://www.npmjs.com/) and [nodenv](https://github.com/nodenv/nodenv) installed.

```bash
nodenv install && npm install
```

You can run the configuration with
```bash
npm start
```

## Proposed Use Case
I want to bridge together a telegram group, telegram channel,
discord server, and affiliated minecraft server.

The Telegram group will act as a "source of trust," which
will act as the primary channel for entering the community.

The Discord server will be dependent on the Telegram group, requiring the user
to be a part of the group in order to view/read content.

The Minecraft server will be dependent on the Discord, requiring the user
to be a part of the Discord **and** Telegram group in order to join the server.

Hadvar will allow me to enforce these community restrictions and also efficiently
manage banning users
