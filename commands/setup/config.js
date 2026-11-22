const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { isActive } = require('../../utils/raidmode');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('View current RATZ BOT settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, client, config) {
    const anti = config.antiRaid || {};
    const am = config.autoMod || {};
    const lv = config.levels || {};
    const vm = config.voiceMod || {};
    const ver = config.verification || {};

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${config.botName} Configuration`)
      .addFields(
        {
          name: '📈 Levels',
          value:
            `Enabled: **${lv.enabled ? 'Yes' : 'No'}** · XP: **${lv.xpPerMessage || 15}** · CD: **${lv.xpCooldownSeconds || 60}s**\n` +
            `Level-up: ${config.levelUpChannelId ? `<#${config.levelUpChannelId}>` : 'Same channel'}`,
        },
        {
          name: '✅ Verification',
          value:
            `Enabled: **${ver.enabled ? 'Yes' : 'No'}**\n` +
            `Unverified: ${config.unverifiedRoleId ? `<@&${config.unverifiedRoleId}>` : '—'}\n` +
            `Member: ${config.memberRoleId ? `<@&${config.memberRoleId}>` : '—'}`,
        },
        {
          name: '🎫 Tickets',
          value:
            `Category: ${config.ticketCategoryId ? `\`${config.ticketCategoryId}\`` : 'Not set'}\n` +
            `Support role: ${config.ticketSupportRoleId ? `<@&${config.ticketSupportRoleId}>` : '—'}`,
        },
        {
          name: '🛡️ Protection',
          value:
            `Anti-raid: **${anti.enabled ? 'On' : 'Off'}** · Raid mode: **${isActive(interaction.guild.id) ? 'ON' : 'Off'}**\n` +
            `Auto-mod: **${am.enabled ? 'On' : 'Off'}** · NSFW filter: **${am.blockNSFWLinks ? 'On' : 'Off'}**\n` +
            `Alt detection: **${config.altDetection?.enabled ? 'On' : 'Off'}**`,
        },
        {
          name: '🔊 Voice',
          value: `Auto-join: **${vm.autoJoin !== false ? 'On' : 'Off'}** · Spam protect: **${vm.enabled ? 'On' : 'Off'}**`,
        },
        {
          name: '📋 Channels',
          value:
            `Log: ${config.logChannelId ? `<#${config.logChannelId}>` : 'Not set'}\n` +
            `Welcome name: **${config.welcomeChannelName}**`,
        }
      )
      .setFooter({ text: 'Use setup commands to change values.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
