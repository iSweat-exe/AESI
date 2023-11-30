const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Répond avec votre solde")
    .addUserOption(option => 
      option.setName('player')
        .setDescription('Joueur dont vous voulez voir la balance (Facultatif)')
        .setRequired(false)
    ),
  async execute(interaction, profileData) {
    const { user, options } = interaction;
    const targetUser = options.getUser('player') || user;
    const { id, username } = targetUser;
    
    let targetProfileData = await profileModel.findOne({ userId: id });

    if (!targetProfileData) {
      return interaction.reply(`Le joueur ${username} n'a pas de profil.`);
    }

    let { balance } = targetProfileData;

    await interaction.reply(`${targetUser} possède **${balance} pièces**`);
  },
};
