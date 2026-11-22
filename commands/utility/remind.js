const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { add } = require('../../utils/reminders');

function parseDuration(str) {
  const m = str.trim().match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * mult[u];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder')
    .addStringOption(o =>
      o.setName('time').setDescription('e.g. 10m, 2h, 1d').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('text').setDescription('What to remind you about').setRequired(true)
    ),
  async execute(interaction, client, config) {
    const time = interaction.options.getString('time');
    const text = interaction.options.getString('text');
    const ms = parseDuration(time);
    if (!ms || ms < 10000 || ms > 30 * 86400000) {
      return interaction.reply({
        content: 'Invalid time. Use like `10m`, `2h`, `1d` (10s–30d).',
        ephemeral: true,
      });
    }
    const when = Date.now() + ms;
    add(interaction.user.id, interaction.channel.id, interaction.guild.id, text, when);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embedColor)
          .setDescription(`Reminder set for <t:${Math.floor(when / 1000)}:R>:\n>>> ${text}`),
      ],
      ephemeral: true,
    });
  },
};
