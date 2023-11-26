const { SlashCommandBuilder } = require("discord.js");
const { coinflipReward } = require("../globalValues.json");
const profileModel = require("../models/profileSchema");
const parseMilliseconds = require("parse-ms-2");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin for a free bonus")
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Heads or tails")
        .setRequired(true)
        .addChoices(
          { name: "Heads", value: "Heads" },
          { name: "Tails", value: "Tails" }
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
        `You can flip again in ${minutes} min ${seconds} sec.`
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
    const result = randomNum ? "Heads" : "Tails";
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
        `Winner ! You won ${coinflipReward} coins with **${choice}**`
      );
    } else {
      await profileModel.findOneAndUpdate(
        {
          userId: id,
        },
        {
          $inc: {
            balance: -coinflipReward,
          },
        }
      );

      await interaction.editReply(
        `Lost... You lost ${coinflipReward} coins with **${choice}**`
      );
    }
  },
};
