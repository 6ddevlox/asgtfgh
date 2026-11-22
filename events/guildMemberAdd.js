const { Events, EmbedBuilder } = require('discord.js');
const { trackJoin, isLocked, setLockdown, accountAgeDays } = require('../utils/antiraid');
const { trackAndCheck } = require('../utils/altdetect');
const { trackJoin: trackActivityJoin } = require('../utils/activity');
const { getCache, setCache, addInviteCredit } = require('../utils/invites');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client, config) {
    const guild = member.guild;
    const anti = config.antiRaid || {};

    trackActivityJoin(guild.id);

    // Invite tracking
    try {
      const newInvites = await guild.invites.fetch();
      const cached = getCache(guild.id);
      let used = null;
      for (const [code, inv] of newInvites) {
        const prev = cached.get(code);
        if (prev !== undefined && inv.uses > prev) {
          used = inv;
          break;
        }
      }
      // refresh cache
      const map = new Map();
      newInvites.forEach(i => map.set(i.code, i.uses));
      setCache(guild.id, map);
      if (used?.inviter) {
        const total = addInviteCredit(guild.id, used.inviter.id);
        await logAction(guild, config, `📨 **${member.user.tag}** joined via **${used.inviter.tag}** (code \`${used.code}\`) — total invites: ${total}`);
      }
    } catch (_) {}


    // ── Anti-raid checks ───────────────────────────────────────
    if (anti.enabled) {
      if (isLocked(guild.id)) {
        try {
          await member.kick('Server is in anti-raid lockdown');
          return;
        } catch (_) {}
      }

      if (anti.minAccountAgeDays && accountAgeDays(member.user) < anti.minAccountAgeDays) {
        try {
          await member.kick(`Account younger than ${anti.minAccountAgeDays} days`);
          await logAction(guild, config, `Kicked ${member.user.tag} — account too new.`);
          return;
        } catch (_) {}
      }

      const count = trackJoin(guild.id, member.id, anti.joinWindowSeconds || 12);
      if (count >= (anti.joinThreshold || 8)) {
        setLockdown(guild.id, anti.lockdownDurationMinutes || 10);
        await logAction(
          guild,
          config,
          `🚨 Anti-raid triggered! ${count} joins in ${anti.joinWindowSeconds}s. Lockdown for ${anti.lockdownDurationMinutes || 10} min.`
        );
        try {
          if (anti.action === 'ban') {
            await member.ban({ reason: 'Anti-raid' });
          } else {
            await member.kick('Anti-raid join spike');
          }
        } catch (_) {}
        return;
      }
    }

    // ── Alt detection ──────────────────────────────────────────
    const alt = trackAndCheck(guild.id, member, config);
    if (alt.flagged) {
      const msg = `⚠️ Possible alt: **${member.user.tag}** (${member.id})\n• ${alt.reasons.join('\n• ')}`;
      await logAction(guild, config, msg);
      if (!config.altDetection?.flagOnly && alt.reasons.some(r => r.includes('days old'))) {
        // Already handled by anti-raid age check usually; skip double-kick
      }
    }

    // ── Auto roles ─────────────────────────────────────────────
    try {
      if (config.verification?.enabled && config.unverifiedRoleId) {
        const role = guild.roles.cache.get(config.unverifiedRoleId);
        if (role) await member.roles.add(role, 'Verification gate');
      } else if (config.memberRoleId) {
        const role = guild.roles.cache.get(config.memberRoleId);
        if (role) await member.roles.add(role, 'Auto member role');
      }
    } catch (err) {
      console.error('Auto-role failed:', err.message);
    }

    // ── Welcome message ────────────────────────────────────────
    const welcomeChannel = guild.channels.cache.find(
      ch => ch.name === config.welcomeChannelName && ch.isTextBased()
    );
    if (!welcomeChannel) return;

    const verifyHint = config.verification?.enabled
      ? `\n👉 Complete verification to unlock the server`
      : `\n👉 Grab roles if available`;

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`Welcome to the ${config.gameName} community! 🐀`)
      .setDescription(
        `Hey **${member.user.username}**!\n\n` +
          `You've joined the official Discord for **${config.gameName}**.\n\n` +
          `👉 Read the rules` +
          verifyHint +
          `\n👉 Chat, level up, and play!\n\n` +
          `Stay sharp. Stay Ratz.`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Member #${guild.memberCount}` })
      .setTimestamp();

    try {
      await welcomeChannel.send({ content: `Welcome <@${member.id}>!`, embeds: [embed] });
    } catch (err) {
      console.error('Failed to send welcome message:', err.message);
    }

    // Welcome DM
    if (config.welcomeDm !== false) {
      try {
        await member.send(
          `Welcome to **${guild.name}** / **${config.gameName}**!\nRead the rules and have fun. Stay sharp. Stay Ratz.`
        );
      } catch (_) {}
    }
  },
};

async function logAction(guild, config, text) {
  if (!config.logChannelId) return;
  const ch = guild.channels.cache.get(config.logChannelId);
  if (!ch?.isTextBased()) return;
  try {
    await ch.send(text);
  } catch (_) {}
}
