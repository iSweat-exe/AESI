const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Affiche toutes les commandes disponibles."),
  async execute(interaction) {
    const commands = [
      {
        name: "/balance",
        description: "Vérifiez votre solde.",
      },
      {
        name: "/machine",
        description: "Jouez à la machine à sous.",
      },
      {
        name: "/coinflip",
        description: "Lancer une pièce.",
      },
      {
        name: "/leaderboard",
        description: "Affiche les 10 plus riche du serveur.",
      },
      {
        name: "/help",
        description: "Affiche toutes les commandes disponibles.",
      },
      {
        name: "/daily",
        description: "Réclamez votre récompense quotidienne.",
      },
      {
        name: "/donate",
        description: "Don à un utilisateur.",
      },
      // Ajoutez d'autres commandes ici
    ];

    const embed = new EmbedBuilder()
      .setTitle("Commandes disponibles")
      .setColor(0x45d6fd)
      .setDescription("Voici une liste de toutes les commandes disponibles :");

    commands.forEach((command) => {
      embed.addFields({
        name: command.name,
        value: command.description,
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};