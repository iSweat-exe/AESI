const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Accès à toutes les commandes d'administration")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Ajouter des pièces au solde d'un utilisateur")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("L'utilisateur auquel vous souhaitez ajouter des pièces")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Le nombre de pièces à ajouter")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("subtract")
        .setDescription("Soustraire des pièces au solde d'un utilisateur")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("L'utilisateur à qui vous souhaitez soustraire des pièces")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("La quantité de pièces à soustraire")
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
        `Ajout de ${amount} pièces au solde de ${user.username}`
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
        `Soustraction de ${amount} pièces de ${user.username}'s balance`
      )
    }
  },
};
