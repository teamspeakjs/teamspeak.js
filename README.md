# 🚀 Teamspeak 3 ServerQuery Client

[![Discord server](https://img.shields.io/discord/920801635649880064?color=5865F2&logo=discord&logoColor=white)](https://lix.qa/tjs-dc/)
[![npm version](https://img.shields.io/npm/v/teamspeak.js.svg?maxAge=3600)](https://www.npmjs.com/package/teamspeak.js)
[![npm downloads](https://img.shields.io/npm/dt/teamspeak.js.svg?maxAge=3600)](https://www.npmjs.com/package/teamspeak.js)
[![Last commit.](https://img.shields.io/github/last-commit/teamspeakjs/teamspeak.js.svg?logo=github&logoColor=ffffff)](https://github.com/teamspeakjs/teamspeak.js/commits/main)
[![GitHub stars](https://img.shields.io/github/stars/teamspeakjs/teamspeak.js?style=flat&color=5865F2&logo=github&logoColor=ffffff)](https://github.com/teamspeakjs/teamspeak.js/stargazers)

A fully typesafe and easy-to-use Node.js client for interacting with Teamspeak 3 servers via ServerQuery.

💡 **Inspired by [Discord.js](https://discord.js.org/),** bringing a similar event-driven and easy-to-use interface to Teamspeak 3.

**Documentation coming soon!**

Stay tuned for installation instructions, more usage examples, and more.

✨ **More features are coming soon!** Feel free to contribute and help improve the project.

🔗 [Website](https://teamspeak.js.org)

🔗 [View on npm](https://www.npmjs.com/package/teamspeak.js)

## Examples

```typescript
import { Query } from 'teamspeak.js';

const query = new Query({
  host: '127.0.0.1',
  port: 10011,
});

query.on('ready', async () => {
  console.log('Connected to TeamSpeak server!');

  await query.login('serveradmin', 'p4ssw0rd'); // Login with query credentials
  await query.useVirtualServer(1); // Select VirtualServer with ID 1
  await query.notifications.subscribeAll(); // Subscribe to ALL notifications (channelcreated, clientmoved, ...)

  // You're free to go!

  // Fetch all clients
  const clients = await query.clients.fetch();

  console.log('There are currently', clients.size, 'clients');

  // Create a new permanent channel
  const createdChannel = await query.channels.create({ name: 'New Channel', type: 'permanent' });

  console.log('Created channel:', createdChannel);

  // Edit the channel
  await createdChannel.edit({ name: 'Changed Name', topic: 'Just chilling' });

  // Delete the channel
  await createdChannel.delete();
});

query.on('ChannelCreate', (channel) => {
  console.log('Some channel got created:', channel);
});

query.on('ChannelUpdate', (before, after) => {
  if (before.name !== after.name) {
    console.log(`Channel name of ${before.id} changed from "${before.name}" to "${after.name}"`);
  }
});

query.on('TextMessage', (message) => {
  console.log(
    `Received a ${message.mode}-message from ${message.invoker.nickname || message.invoker.id || 'Unknown Client'}: ${message.content}`,
  );
});

query.connect();
```
