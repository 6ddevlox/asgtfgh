const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock or unlock this channel')
    .addStringOption(o =>
      o
        .setName('state')
        .setDescription('lock or unlock')
        .setRequired(true)
        .addChoices({ name: 'lock', value: 'lock' }, { name: 'unlock', value: 'unlock' })
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction, client, config) {
    const state = interaction.options.getString('state');
    const everyone = interaction.guild.roles.everyone;
    try {
      if (state === 'lock') {
        await interaction.channel.permissionOverwrites.edit(everyone, { SendMessages: false });
        await interaction.reply({ content: '🔒 Channel locked.' });
      } else {
        await interaction.channel.permissionOverwrites.edit(everyone, { SendMessages: null });
        await interaction.reply({ content: '🔓 Channel unlocked.' });
      }
    } catch (err) {
      await interaction.reply({ content: `Failed: ${err.message}`, ephemeral: true });
    }
  },
};
