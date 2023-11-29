const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Répond avec votre solde"),
  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const { balance } = profileData;

    await interaction.reply(`<@${id}> possède **${balance} pièces**`);
  },
};
