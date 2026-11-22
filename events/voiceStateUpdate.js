const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const {
  joinChannel,
  maybeLeave,
  humanCount,
  getVoiceConnection,
} = require('../utils/voiceManager');
const { track, untrack, isTemp } = require('../utils/tempVoice');

const joinHistory = new Map();

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState, client, config) {
    const vm = config.voiceMod || {};
    const guild = newState.guild || oldState.guild;
    if (!guild) return;

    const member = newState.member || oldState.member;
    const isBot = member?.user?.bot;

    // ── Temp voice channels ────────────────────────────────────
    const tv = config.tempVoice || {};
    if (tv.enabled && tv.triggerChannelId && !isBot) {
      // User joined the trigger channel → create temp VC
      if (newState.channelId === tv.triggerChannelId && oldState.channelId !== tv.triggerChannelId) {
        try {
          const nameTemplate = tv.nameTemplate || "{user}'s VC";
          const name = nameTemplate
            .replace('{user}', member.displayName || member.user.username)
            .slice(0, 100);

          const parent = tv.categoryId || newState.channel?.parentId || null;

          const tempChannel = await guild.channels.create({
            name,
            type: ChannelType.GuildVoice,
            parent: parent || undefined,
            permissionOverwrites: [
              {
                id: member.id,
                allow: [
                  PermissionFlagsBits.ManageChannels,
                  PermissionFlagsBits.MoveMembers,
                  PermissionFlagsBits.Connect,
                  PermissionFlagsBits.Speak,
                ],
              },
            ],
          });

          track(tempChannel.id, guild.id, member.id);
          await member.voice.setChannel(tempChannel).catch(() => {});
        } catch (err) {
          console.error('[tempvoice] create failed:', err.message);
        }
      }

      // Someone left a channel — if it was a temp VC and empty, delete it
      if (oldState.channelId && oldState.channelId !== newState.channelId) {
        if (isTemp(oldState.channelId)) {
          const ch = guild.channels.cache.get(oldState.channelId);
          if (ch) {
            const humans = ch.members.filter(m => !m.user.bot).size;
            if (humans === 0) {
              untrack(oldState.channelId);
              await ch.delete('Temp VC empty').catch(() => {});
            }
          } else {
            untrack(oldState.channelId);
          }
        }
      }
    }

    // ── Voice mod auto-join ────────────────────────────────────
    if (vm.enabled && vm.autoJoin !== false && !isBot) {
      try {
        if (newState.channelId && oldState.channelId !== newState.channelId) {
          const channel = newState.channel;
          // Don't join the trigger channel itself
          if (channel && humanCount(channel) > 0 && channel.id !== tv.triggerChannelId) {
            const current = getVoiceConnection(guild.id);
            const currentId = current?.joinConfig?.channelId;
            const currentCh = currentId ? guild.channels.cache.get(currentId) : null;
            const currentHumans = humanCount(currentCh);
            const targetHumans = humanCount(channel);
            if (!current || targetHumans >= currentHumans) {
              await joinChannel(channel, config);
            }
          }
        }
        if (oldState.channelId && oldState.channelId !== newState.channelId) {
          maybeLeave(guild, config);
        }
        if (!newState.channelId) maybeLeave(guild, config);
      } catch (err) {
        console.error('[voice] auto-join error:', err.message);
      }
    }

    // ── Join-spam protection ───────────────────────────────────
    if (!vm.enabled) return;
    if (!newState.channelId || oldState.channelId === newState.channelId) return;
    if (isBot) return;

    const userId = newState.id;
    const now = Date.now();
    if (!joinHistory.has(userId)) joinHistory.set(userId, []);
    const list = joinHistory.get(userId);
    list.push(now);

    const windowMs = (vm.joinSpamWindowSeconds || 15) * 1000;
    const cutoff = now - windowMs;
    while (list.length && list[0] < cutoff) list.shift();

    if (list.length >= (vm.joinSpamThreshold || 6)) {
      try {
        await newState.member.timeout(5 * 60 * 1000, 'Voice join spam');
        joinHistory.set(userId, []);
        if (config.logChannelId) {
          const ch = guild.channels.cache.get(config.logChannelId);
          if (ch?.isTextBased()) {
            await ch.send(`🔇 Voice join-spam: timed out **${newState.member.user.tag}**`);
          }
        }
      } catch (err) {
        console.error('Voice mod timeout failed:', err.message);
      }
    }
  },
};
