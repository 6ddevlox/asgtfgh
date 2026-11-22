const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { save } = require('../../utils/giveaways');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a giveaway')
    .addStringOption(o => o.setName('prize').setDescription('Prize').setRequired(true))
    .addIntegerOption(o =>
      o.setName('minutes').setDescription('Duration in minutes').setRequired(true).setMinValue(1).setMaxValue(10080)
    )
    .addIntegerOption(o =>
      o.setName('winners').setDescription('Number of winners').setRequired(false).setMinValue(1).setMaxValue(20)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, client, config) {
    const prize = interaction.options.getString('prize');
    const minutes = interaction.options.getInteger('minutes');
    const winners = interaction.options.getInteger('winners') || 1;
    const endsAt = Date.now() + minutes * 60 * 1000;

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('🎉 Giveaway')
      .setDescription(
        `**Prize:** ${prize}\n**Winners:** ${winners}\n**Ends:** <t:${Math.floor(endsAt / 1000)}:R>\n\nClick **Enter** to join!`
      )
      .setFooter({ text: `Hosted by ${interaction.user.tag}` })
      .setTimestamp(endsAt);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('giveaway_enter')
        .setLabel('Enter (0)')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎉')
    );

    const msg = await interaction.channel.send({ embeds: [embed], components: [row] });
    save(interaction.guild.id, msg.id, {
      prize,
      winners,
      endsAt,
      channelId: interaction.channel.id,
      hostId: interaction.user.id,
      entries: [],
    });

    // schedule end
    setTimeout(() => endGiveaway(client, interaction.guild.id, msg.id, config), minutes * 60 * 1000 + 500);

    await interaction.reply({ content: 'Giveaway started!', ephemeral: true });
  },
};

async function endGiveaway(client, guildId, messageId, config) {
  const { get, remove } = require('../../utils/giveaways');
  const data = get(guildId, messageId);
  if (!data) return;
  remove(guildId, messageId);

  const channel = await client.channels.fetch(data.channelId).catch(() => null);
  if (!channel) return;
  const msg = await channel.messages.fetch(messageId).catch(() => null);

  const entries = data.entries || [];
  let winners = [];
  const pool = [...entries];
  for (let i = 0; i < data.winners && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(idx, 1)[0]);
  }

  const embed = new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle('🎉 Giveaway Ended')
    .setDescription(
      `**Prize:** ${data.prize}\n**Winners:** ${
        winners.length ? winners.map(id => `<@${id}>`).join(', ') : 'No valid entries'
      }`
    )
    .setTimestamp();

  if (msg) {
    await msg.edit({ embeds: [embed], components: [] }).catch(() => {});
  }
  await channel.send({
    content: winners.length ? `Congrats ${winners.map(id => `<@${id}>`).join(', ')}!` : 'Giveaway ended with no entries.',
    embeds: [embed],
  }).catch(() => {});
}

module.exports.endGiveaway = endGiveaway;
