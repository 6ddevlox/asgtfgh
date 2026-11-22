const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// guildId-userId -> { reason, at }
const afkMap = new Map();

function key(guildId, userId) {
  return `${guildId}-${userId}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set yourself AFK')
    .addStringOption(o => o.setName('reason').setDescription('AFK reason').setRequired(false)),
  async execute(interaction, client, config) {
    const reason = interaction.options.getString('reason') || 'AFK';
    afkMap.set(key(interaction.guild.id, interaction.user.id), {
      reason,
      at: Date.now(),
    });
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embedColor)
          .setDescription(`You're now AFK: **${reason}**`),
      ],
    });
  },
  afkMap,
  key,
};
