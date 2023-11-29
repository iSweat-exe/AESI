const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Affiche vos statistiques, y compris le total de l'argent en circulation."),
  async execute(interaction, profileData) {
    await interaction.deferReply();

    const { username, id } = interaction.user;
    const { balance, totalSpent } = profileData;

    // Obtenir l'argent total en circulation (somme des balances de tous les utilisateurs)
    const totalMoneyInCirculation = await profileModel.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);

    const totalMoney = totalMoneyInCirculation.length > 0 ? totalMoneyInCirculation[0].total : 0;

    await interaction.followUp(`||<@${id}>||`);

    let statsEmbed = new EmbedBuilder()
      .setTitle(`**Vos statistiques**`)
      .setColor(0x45d6fd)
      .setDescription(`**Votre solde :** ${balance} pièces\n**Argent total en circulation sur le serveur :** ${totalMoney} pièces\n**Argent total dépensé :** ${totalSpent} pièces\n**Argent total depuis Création de compte :** ${balance + totalSpent} pièces`)
      .setFooter({ text: `Vous pourrez consulter plus de statistiques à l'avenir !` });

    await interaction.editReply({ embeds: [statsEmbed] });
  },
};
