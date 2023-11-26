const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Replies with your balance"),
  async execute(interaction, profileData) {
    const { balance } = profileData;
    const username = interaction.user.username;

    await interaction.reply(`${username} has ${balance} coins`);
  },
};
