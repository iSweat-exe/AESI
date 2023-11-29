const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Répond avec votre solde"),
  async execute(interaction, profileData) {
    const { balance } = profileData;
    const username = interaction.user.username;

    await interaction.reply(`${username} possède ${balance} pièces`);
  },
};
