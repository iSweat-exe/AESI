const { SlashCommandBuilder } = require("discord.js");
const parseMilliseconds = require("parse-ms-2");
const profileModel = require("../models/profileSchema");
const { dailyMin, dailyMax } = require("../globalValues.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Redeems your daily reward."),
  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const { dailyLastUsed } = profileData;

    const cooldown = 86400000;
    const timeLeft = cooldown - (Date.now() - dailyLastUsed);

    if (timeLeft > 0) {
      const { hours, minutes, seconds } = parseMilliseconds(timeLeft);
      await interaction.reply({
        content: `You can get your daily reward again in ${hours} hrs ${minutes} min ${seconds} sec.`,
        ephemeral: true,
      });
      return;
    }

    const randomAmt = Math.floor(
      Math.random() * (dailyMax - dailyMin + 1) + dailyMin
    );

    try {
      await profileModel.findOneAndUpdate(
        { userId: id },
        {
          $set: {
            dailyLastUsed: Date.now(),
          },
          $inc: {
            balance: randomAmt,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }

    await interaction.reply({
      content: `You have received ${randomAmt} coins!`,
      ephemeral: true,
    });
  },
};