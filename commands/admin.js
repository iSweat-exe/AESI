const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Acces to all the admin commands")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add coins to a user balance")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to add coins to")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of coins to add")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("subtract")
        .setDescription("Subtract coins to a user balance")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to subtract coins to")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of coins to subtract")
            .setRequired(true)
            .setMinValue(1)
        )
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const adminSubcommand = interaction.options.getSubcommand();

    if (adminSubcommand === "add") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      await profileModel.findOneAndUpdate(
        {
          userId: user.id,
        },
        {
          $inc: {
            balance: amount,
          },
        }
      );

      await interaction.editReply(
        `Added ${amount} coins to ${user.username}'s balance`
      )
    }

    if (adminSubcommand === "subtract") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      await profileModel.findOneAndUpdate(
        {
          userId: user.id,
        },
        {
          $inc: {
            balance: -amount,
          },
        }
      );

      await interaction.editReply(
        `Subtracted ${amount} coins from ${user.username}'s balance`
      )
    }
  },
};
