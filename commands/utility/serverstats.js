const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getStats } = require('../../utils/activity');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('Today\'s server activity stats'),
  async execute(interaction, client, config) {
    const stats = getStats(interaction.guild.id);

    const topLines = [];
    for (const t of stats.topChatters) {
      let name = t.id;
      try {
        const u = await client.users.fetch(t.id);
        name = u.username;
      } catch (_) {}
      topLines.push(`**${name}** — ${t.count} msgs`);
    }

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`📊 Activity — ${stats.day}`)
      .addFields(
        { name: 'Messages', value: `${stats.messages}`, inline: true },
        { name: 'Joins', value: `${stats.joins}`, inline: true },
        { name: 'Leaves', value: `${stats.leaves}`, inline: true },
        {
          name: 'Top chatters today',
          value: topLines.length ? topLines.join('\n') : 'No data yet',
        }
      )
      .setFooter({ text: interaction.guild.name })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
