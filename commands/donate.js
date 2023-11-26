const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("donate")
    .setDescription("Donate your coins to another user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to donate to")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of coins you want to donate")
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
        `You do not have ${donateAmt} coins in your balance`
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
        `${receiveUser.username} is not in the currency system.`
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
      `You have donated ${donateAmt} coins to ${receiveUser.username}`
    )
  },
};
