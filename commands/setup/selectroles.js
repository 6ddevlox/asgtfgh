const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
} = require('discord.js');
const { savePanel } = require('../../utils/selectRoles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('selectroles')
    .setDescription('Post a dropdown role-select menu (up to 5 roles)')
    .addStringOption(o => o.setName('title').setDescription('Panel title').setRequired(true))
    .addStringOption(o => o.setName('description').setDescription('Panel description').setRequired(true))
    .addRoleOption(o => o.setName('role1').setDescription('Role 1').setRequired(true))
    .addStringOption(o => o.setName('label1').setDescription('Label for role 1').setRequired(true))
    .addRoleOption(o => o.setName('role2').setDescription('Role 2').setRequired(false))
    .addStringOption(o => o.setName('label2').setDescription('Label for role 2').setRequired(false))
    .addRoleOption(o => o.setName('role3').setDescription('Role 3').setRequired(false))
    .addStringOption(o => o.setName('label3').setDescription('Label for role 3').setRequired(false))
    .addRoleOption(o => o.setName('role4').setDescription('Role 4').setRequired(false))
    .addStringOption(o => o.setName('label4').setDescription('Label for role 4').setRequired(false))
    .addRoleOption(o => o.setName('role5').setDescription('Role 5').setRequired(false))
    .addStringOption(o => o.setName('label5').setDescription('Label for role 5').setRequired(false))
    .addChannelOption(o =>
      o
        .setName('channel')
        .setDescription('Channel to post in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction, client, config) {
    await interaction.deferReply({ ephemeral: true });

    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const options = [];
    for (let i = 1; i <= 5; i++) {
      const role = interaction.options.getRole(`role${i}`);
      const label = interaction.options.getString(`label${i}`);
      if (role && label) {
        options.push({
          label: label.slice(0, 100),
          value: role.id,
          description: role.name.slice(0, 100),
        });
      }
    }

    if (!options.length) {
      return interaction.editReply('Need at least one role + label.');
    }

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(title)
      .setDescription(description + '\n\nSelect roles from the menu below. Select again to remove.')
      .setFooter({ text: 'RATZ role menu' })
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId('select_roles')
      .setPlaceholder('Choose your roles…')
      .setMinValues(0)
      .setMaxValues(options.length)
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);

    const msg = await channel.send({ embeds: [embed], components: [row] });
    savePanel(
      interaction.guild.id,
      msg.id,
      options.map(o => ({ label: o.label, roleId: o.value }))
    );

    await interaction.editReply(`Role select menu posted in ${channel}.`);
  },
};
