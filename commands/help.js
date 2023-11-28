const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays all available commands."),
  async execute(interaction) {
    const commands = [
      {
        name: "/balance",
        description: "Check your balance.",
      },
      {
        name: "/machine",
        description: "Play the slot machine.",
      },
      {
        name: "/coinflip",
        description: "Flip a coin.",
      },
      {
        name: "/leaderboard",
        description: "Shows the top 10 coins earners.",
      },
      {
        name: "/help",
        description: "Displays all available commands.",
      },
      {
        name: "/daily",
        description: "Claim your daily reward.",
      },
      {
        name: "/donate",
        description: "Donate to a user.",
      },
      // Ajoutez d'autres commandes ici
    ];

    const embed = new EmbedBuilder()
      .setTitle("Available Commands")
      .setColor(0x45d6fd)
      .setDescription("Here is a list of all available commands:");

    commands.forEach((command) => {
      embed.addFields({
        name: command.name,
        value: command.description,
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};