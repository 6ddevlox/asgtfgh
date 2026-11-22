const { Events, EmbedBuilder } = require('discord.js');
const { addXp } = require('../utils/levels');
const { checkMessage, incrementWarn } = require('../utils/automod');
const { containsBlacklisted } = require('../utils/blacklist');
const { trackMessage } = require('../utils/activity');
const { getSticky, updateLastId } = require('../utils/sticky');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client, config) {
    if (!message.guild || message.author.bot) return;

    // Sticky re-post (skip if this message IS the sticky)
    try {
      const sticky = getSticky(message.guild.id, message.channel.id);
      if (sticky && sticky.content && message.id !== sticky.lastMessageId) {
        if (sticky.lastMessageId) {
          await message.channel.messages.delete(sticky.lastMessageId).catch(() => {});
        }
        const stickyEmbed = new EmbedBuilder()
          .setColor(config.embedColor)
          .setDescription(sticky.content)
          .setFooter({ text: '📌 Sticky message' });
        const sent = await message.channel.send({ embeds: [stickyEmbed] });
        updateLastId(message.guild.id, message.channel.id, sent.id);
      }
    } catch (_) {}



    // Channel mode enforcement
    try {
      const mode = config.channelModes?.[message.channel.id];
      if (mode && !message.member?.permissions?.has?.('ManageMessages')) {
        const hasAttachment = message.attachments?.size > 0;
        const hasImage = [...(message.attachments?.values() || [])].some(a =>
          (a.contentType || '').startsWith('image/')
        );
        const hasVideo = [...(message.attachments?.values() || [])].some(a =>
          (a.contentType || '').startsWith('video/')
        );
        const hasLink = /https?:\/\//i.test(message.content || '');
        let ok = true;
        if (mode === 'image' && !hasImage) ok = false;
        if (mode === 'link' && !hasLink) ok = false;
        if (mode === 'media' && !hasImage && !hasVideo) ok = false;
        if (!ok) {
          await message.delete().catch(() => {});
          return;
        }
      }
    } catch (_) {}

    // AFK remove + mention notice
    try {
      const afkMod = require('../commands/fun/afk');
      const k = afkMod.key(message.guild.id, message.author.id);
      if (afkMod.afkMap.has(k)) {
        afkMod.afkMap.delete(k);
        await message.channel.send(`Welcome back <@${message.author.id}>, AFK removed.`).then(m =>
          setTimeout(() => m.delete().catch(() => {}), 5000)
        ).catch(() => {});
      }
      for (const [, u] of message.mentions.users) {
        const mk = afkMod.key(message.guild.id, u.id);
        const info = afkMod.afkMap.get(mk);
        if (info) {
          await message.reply(`**${u.username}** is AFK: ${info.reason}`).catch(() => {});
        }
      }
    } catch (_) {}

    // Auto-respond
    try {
      if (config.autoRespond !== false && message.content) {
        const { match } = require('../utils/autorespond');
        const hit = match(message.guild.id, message.content);
        if (hit) {
          await message.reply(hit.response).catch(() => {});
        }
      }
    } catch (_) {}

    // Activity tracking
    if (config.activity?.trackMessages !== false) {
      trackMessage(message.guild.id, message.author.id);
    }

    // ── Auto-mod + blacklist ───────────────────────────────────
    const am = config.autoMod || {};
    if (am.enabled) {
      const hit = containsBlacklisted(message.guild.id, message.content || '');
      const result = checkMessage(message, am, hit);
      if (result.action) {
        try {
          await message.delete().catch(() => {});
        } catch (_) {}

        if (result.action === 'mute') {
          const duration = (am.muteDurationMinutes || 10) * 60 * 1000;
          try {
            await message.member.timeout(duration, result.reason);
          } catch (_) {}
          const warns = incrementWarn(message.author.id);
          await notifyMod(message, config, result.reason, true, warns);
        } else {
          await notifyMod(message, config, result.reason, false);
        }
        return;
      }
    }

    // ── Leveling ───────────────────────────────────────────────
    const lv = config.levels || {};
    if (!lv.enabled) return;
    if ((message.content || '').trim().length < (lv.minMessageLength || 3)) return;

    const cooldownMs = (lv.xpCooldownSeconds || 60) * 1000;
    const amount = lv.xpPerMessage || 15;

    const result = addXp(message.guild.id, message.author.id, amount, cooldownMs);
    if (result.skipped || !result.leveledUp) return;

    let channel = null;
    if (config.levelUpChannelId) {
      channel = message.guild.channels.cache.get(config.levelUpChannelId);
    }
    if (!channel) channel = message.channel;

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Level Up! 🐀')
      .setDescription(
        `**${message.author.username}** reached **Level ${result.newLevel}**!\nStay sharp. Stay Ratz.`
      )
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    try {
      await channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
    } catch (err) {
      console.error('Level-up message failed:', err.message);
    }

    // Level role rewards
    try {
      const roleId = config.levelRoles?.[String(result.newLevel)];
      if (roleId && message.member && !message.member.roles.cache.has(roleId)) {
        await message.member.roles.add(roleId, `Reached level ${result.newLevel}`);
      }
    } catch (_) {}
  },
};

async function notifyMod(message, config, reason, muted, warns = 0) {
  const text = muted
    ? `🔇 Auto-muted **${message.author.tag}** for: ${reason}${warns ? ` (warn #${warns})` : ''}`
    : `🗑️ Deleted message from **${message.author.tag}**: ${reason}`;

  if (config.logChannelId) {
    const ch = message.guild.channels.cache.get(config.logChannelId);
    if (ch?.isTextBased()) {
      await ch.send(text).catch(() => {});
      return;
    }
  }
  try {
    const notice = await message.channel.send({
      content: `${message.author}, your message was removed: **${reason}**`,
    });
    setTimeout(() => notice.delete().catch(() => {}), 6000);
  } catch (_) {}
}
