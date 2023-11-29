const { SlashCommandBuilder } = require("discord.js");
const { coinflipReward } = require("../globalValues.json");
const profileModel = require("../models/profileSchema");
const parseMilliseconds = require("parse-ms-2");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Lancez une pièce pour un bonus gratuit")
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Pile ou face")
        .setRequired(true)
        .addChoices(
          { name: "Pile", value: "Pile" },
          { name: "Face", value: "Face" }
        )
    ),
  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const { coinflipLastUsed } = profileData;

    const cooldown = 3600000; // 1 hour cooldown
    const timeLeft = cooldown - (Date.now() - coinflipLastUsed);

    if (timeLeft > 0) {
      await interaction.deferReply({ ephemeral: true });
      let { minutes, seconds } = parseMilliseconds(timeLeft);
      return await interaction.editReply(
        `Vous pouvez lancer à nouveau une pièce dans ${minutes} min ${seconds} sec.`
      );
    }

    await interaction.deferReply();

    await profileModel.findOneAndUpdate(
      {
        userId: id,
      },
      {
        $set: {
          coinflipLastUsed: Date.now(),
        },
      }
    );

    const randomNum = Math.round(Math.random()); // between 0 and 1
    const result = randomNum ? "Pile" : "Face";
    const choice = interaction.options.getString("choice");

    if (choice === result) {
      await profileModel.findOneAndUpdate(
        {
          userId: id,
        },
        {
          $inc: {
            balance: coinflipReward,
          },
        }
      );

      await interaction.editReply(
        `Gagnant ! Vous avez gagné ${coinflipReward} pièces avec **${choice}**`
      );
    } else {
      await interaction.editReply(
        `Perdu... Vous avez perdu ${coinflipReward} pièces avec **${choice}**`
      );
    }
  },
};
