const { SlashCommandBuilder } = require("discord.js");
const parseMilliseconds = require("parse-ms-2");
const profileModel = require("../models/profileSchema");
const { dailyMin, dailyMax } = require("../globalValues.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily-realtime")
    .setDescription("Redeems your daily reward."),
  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const { dailyLastUsed } = profileData;

    const cooldown = 86400000;
    let timeLeft = cooldown - (Date.now() - dailyLastUsed);

    if (timeLeft > 0) {
      let { hours, minutes, seconds } = parseMilliseconds(timeLeft);
      await interaction.reply(`You can get your daily reward again in ${hours} hrs ${minutes} min ${seconds} sec.`);
      
      let timeLeftMessage = await interaction.fetchReply();
      let interval = setInterval(async () => {
        timeLeft = cooldown - (Date.now() - dailyLastUsed);

        if (timeLeft <= 0) {
          clearInterval(interval);
        } else {
          const { hours, minutes, seconds } = parseMilliseconds(timeLeft);
          await timeLeftMessage.edit(`You can get your daily reward again in ${hours} hrs ${minutes} min ${seconds} sec.`);
        }
      }, 1000);
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
      console.error(err);
      await interaction.reply("An error occurred while processing your request.");
      return;
    }

    await interaction.editReply(`You have received ${randomAmt} coins!`);
  },
};
