const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Shows your statistics, including total money in circulation."),
  async execute(interaction, profileData) {
    await interaction.deferReply();

    const { username, id, createdAt } = interaction.user;
    const { balance, totalSpent } = profileData;

    // Obtenir l'argent total en circulation (somme des balances de tous les utilisateurs)
    const totalMoneyInCirculation = await profileModel.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);

    const totalMoney = totalMoneyInCirculation.length > 0 ? totalMoneyInCirculation[0].total : 0;

    let statsEmbed = new EmbedBuilder()
      .setTitle("**Vos statistiques**")
      .setColor(0x45d6fd)
      .setDescription(`**Votre solde :** ${balance} pièces\n**Argent total en circulation :** ${totalMoney} pièces\n**Argent total dépensé :** ${totalSpent} pièces\n**Argent total depuis Création de compte :** ${balance + totalSpent} pièces`)
      .setFooter({ text: `You can check more stats in the future!` });

    await interaction.editReply({ embeds: [statsEmbed] });
  },
};
