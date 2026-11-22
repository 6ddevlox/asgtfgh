const { Events, ActivityType, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    try {
      require('../utils/tempVoice').loadFromDisk();
    } catch (_) {}

    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setActivity('RATZ | /help', { type: ActivityType.Playing });

    // Cache invites for all guilds
    client.guilds.cache.forEach(async guild => {
      try {
        const invites = await guild.invites.fetch();
        const map = new Map();
        invites.forEach(i => map.set(i.code, i.uses));
        require('../utils/invites').setCache(guild.id, map);
      } catch (_) {}
    });

    // Reminder poller
    setInterval(async () => {
      try {
        const { due } = require('../utils/reminders');
        const items = due();
        for (const r of items) {
          const ch = await client.channels.fetch(r.channelId).catch(() => null);
          if (ch?.isTextBased()) {
            await ch.send(`⏰ <@${r.userId}> reminder: ${r.text}`).catch(() => {});
          }
        }
      } catch (_) {}
    }, 15000);

    // Birthday check once per hour
    setInterval(async () => {
      try {
        const { today } = require('../utils/birthdays');
        const config = require('../config.json');
        for (const guild of client.guilds.cache.values()) {
          const ids = today(guild.id);
          if (!ids.length) continue;
          const ch = guild.channels.cache.find(
            c => c.name === (config.announcementChannelName || 'announcements') && c.isTextBased()
          );
          if (!ch) continue;
          for (const id of ids) {
            // simple dedupe via daily key on client
            const key = `bday-${guild.id}-${id}-${new Date().toDateString()}`;
            if (!client._bdaySent) client._bdaySent = new Set();
            if (client._bdaySent.has(key)) continue;
            client._bdaySent.add(key);
            await ch.send(`🎂 Happy birthday <@${id}>!`).catch(() => {});
          }
        }
      } catch (_) {}
    }, 60 * 60 * 1000);

    // Status rotator
    const statuses = ['RATZ | /help', 'Stay sharp. Stay Ratz.', 'VR Shooter', '/lobby'];
    let si = 0;
    setInterval(() => {
      si = (si + 1) % statuses.length;
      client.user.setActivity(statuses[si], { type: ActivityType.Playing });
    }, 5 * 60 * 1000);
  },
};
