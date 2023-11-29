const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("donate")
    .setDescription("Faites don de vos pièces à un autre utilisateur")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("L'utilisateur à qui vous souhaitez faire un don")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Le montant des pièces que vous souhaitez donner")
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction, profileData) {
    const receiveUser = interaction.options.getUser("user");
    const donateAmt = interaction.options.getInteger("amount");

    const { balance } = profileData;

    if (balance < donateAmt) {
      await interaction.deferReply({ ephemeral: true });
      return await interaction.editReply(
        `Vous n'avez pas ${donateAmt} Coins dans votre solde.`
      );
    }

    const receiveUserData = await profileModel.findOneAndUpdate(
      {
        userId: receiveUser.id,
      },
      {
        $inc: {
          balance: donateAmt,
        },
      }
    );

    if (!receiveUserData) {
      await interaction.deferReply({ ephemeral: true });
      return await interaction.editReply(
        `${receiveUser.username} n'est pas dans le système monétaire.`
      );
    }

    await interaction.deferReply();

    await profileModel.findOneAndUpdate(
      {
        userId: interaction.user.id,
      },
      {
        $inc: {
          balance: -donateAmt,
        },
      }
    );

    interaction.editReply(
      `Vous avez fait don de ${donateAmt} pièces à ${receiveUser.username}`
    )
  },
};
