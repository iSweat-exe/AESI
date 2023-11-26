const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("donate")
    .setDescription("Donate coins to another user.")
    .addUserOption(option =>
      option.setName("target")
        .setDescription("The user you want to donate to.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("The amount of coins you want to donate.")
        .setRequired(true)
    ),
  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const targetUser = interaction.options.getUser("target");
    const amount = interaction.options.getInteger("amount");

    // Check if the donation amount is non-negative
    if (amount <= 0) {
      await interaction.reply("Please enter a positive amount to donate.");
      return;
    }

    // Check if the user has enough coins to donate
    if (profileData.balance < amount) {
      await interaction.reply("You don't have enough coins to donate.");
      return;
    }

    try {
      // Deduct the donated amount from the donor's balance
      await profileModel.findOneAndUpdate(
        { userId: id },
        {
          $inc: {
            balance: -amount,
          },
        }
      );

      // Find the profile of the target user
      const targetProfile = await profileModel.findOne({ userId: targetUser.id });

      // If the target user doesn't exist, you may handle it as needed
      if (!targetProfile) {
        await interaction.reply("The specified user does not have a profile.");
        return;
      }

      // Add the donated amount to the target user's balance
      await profileModel.findOneAndUpdate(
        { userId: targetUser.id },
        {
          $inc: {
            balance: amount,
          },
        }
      );

      await interaction.reply(`You have successfully donated ${amount} coins to ${targetUser.username}.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("An error occurred while processing your donation.");
    }
  },
};
