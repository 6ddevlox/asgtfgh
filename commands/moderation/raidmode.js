const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { isActive, applyLock } = require('../../utils/raidmode');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidmode')
    .setDescription('Toggle raid mode (locks @everyone from sending messages)')
    .addStringOption(opt =>
      opt
        .setName('state')
        .setDescription('on or off')
        .setRequired(true)
        .addChoices(
          { name: 'on', value: 'on' },
          { name: 'off', value: 'off' },
          { name: 'status', value: 'status' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const state = interaction.options.getString('state');

    if (state === 'status') {
      return interaction.reply({
        content: isActive(interaction.guild.id)
          ? '🚨 Raid mode is **ON** — channels are locked.'
          : 'Raid mode is **OFF**.',
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const lock = state === 'on';
    const results = await applyLock(interaction.guild, lock);

    const embed = new EmbedBuilder()
      .setColor(lock ? 0xef4444 : 0x22c55e)
      .setTitle(lock ? '🚨 Raid Mode Enabled' : '✅ Raid Mode Disabled')
      .setDescription(
        lock
          ? `@everyone can no longer send messages in text channels.\nUpdated **${results.changed}** channels (${results.failed} failed).`
          : `Send permissions restored (set to inherit).\nUpdated **${results.changed}** channels (${results.failed} failed).`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    if (config.logChannelId) {
      const ch = interaction.guild.channels.cache.get(config.logChannelId);
      if (ch?.isTextBased()) {
        await ch
          .send(
            `${lock ? '🚨' : '✅'} Raid mode **${lock ? 'ON' : 'OFF'}** by **${interaction.user.tag}**`
          )
          .catch(() => {});
      }
    }
  },
};
