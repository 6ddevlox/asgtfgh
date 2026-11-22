const {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState,
} = require('@discordjs/voice');

/**
 * Per-guild voice presence manager.
 * Discord allows only ONE voice connection per guild per bot.
 * Strategy: follow activity — join the channel people enter, leave when empty.
 */

const leaveTimers = new Map(); // guildId -> timeout

function clearLeaveTimer(guildId) {
  const t = leaveTimers.get(guildId);
  if (t) {
    clearTimeout(t);
    leaveTimers.delete(guildId);
  }
}

function scheduleLeave(guildId, delayMs, connection) {
  clearLeaveTimer(guildId);
  const timer = setTimeout(() => {
    try {
      connection.destroy();
    } catch (_) {}
    leaveTimers.delete(guildId);
  }, delayMs);
  leaveTimers.set(guildId, timer);
}

/**
 * Join (or move to) a voice channel.
 * Returns the connection or null on failure.
 */
async function joinChannel(channel, config) {
  if (!channel || !channel.isVoiceBased()) return null;

  const guildId = channel.guild.id;
  clearLeaveTimer(guildId);

  const existing = getVoiceConnection(guildId);

  // Already in this channel
  if (existing && existing.joinConfig.channelId === channel.id) {
    return existing;
  }

  // Destroy old connection if moving
  if (existing) {
    try {
      existing.destroy();
    } catch (_) {}
  }

  try {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,  // bot doesn't need to hear for basic mod; saves bandwidth
      selfMute: true,
    });

    // Wait until ready (or fail fast)
    await entersState(connection, VoiceConnectionStatus.Ready, 10_000);

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        try {
          connection.destroy();
        } catch (_) {}
      }
    });

    return connection;
  } catch (err) {
    console.error(`[voice] Failed to join ${channel.name}:`, err.message);
    return null;
  }
}

/**
 * Leave the guild's voice channel after a short delay if it's empty of humans.
 */
function maybeLeave(guild, config) {
  const connection = getVoiceConnection(guild.id);
  if (!connection) return;

  const channelId = connection.joinConfig.channelId;
  const channel = guild.channels.cache.get(channelId);
  if (!channel) {
    try {
      connection.destroy();
    } catch (_) {}
    return;
  }

  const humans = channel.members.filter(m => !m.user.bot).size;
  if (humans === 0) {
    const delay = (config.voiceMod?.leaveWhenEmptySeconds ?? 8) * 1000;
    scheduleLeave(guild.id, delay, connection);
  } else {
    clearLeaveTimer(guild.id);
  }
}

/**
 * Count non-bot members in a voice channel.
 */
function humanCount(channel) {
  if (!channel) return 0;
  return channel.members.filter(m => !m.user.bot).size;
}

/**
 * Pick the "best" channel to sit in: the one that just got activity,
 * or the fullest voice channel if we need to choose.
 */
function pickActiveChannel(guild, preferredChannelId) {
  if (preferredChannelId) {
    const ch = guild.channels.cache.get(preferredChannelId);
    if (ch?.isVoiceBased() && humanCount(ch) > 0) return ch;
  }

  // Fallback: fullest non-empty VC
  let best = null;
  let bestCount = 0;
  for (const ch of guild.channels.cache.values()) {
    if (!ch.isVoiceBased()) continue;
    const n = humanCount(ch);
    if (n > bestCount) {
      bestCount = n;
      best = ch;
    }
  }
  return best;
}

module.exports = {
  joinChannel,
  maybeLeave,
  humanCount,
  pickActiveChannel,
  getVoiceConnection,
};
