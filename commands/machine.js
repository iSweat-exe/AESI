const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema");

function generateResult(probability, emojis) {
  const result = Array.from({ length: 3 }, () => {
    const random = Math.random();
    if (random < probability) {
      return emojis[0];
    }
    return emojis[Math.floor(Math.random() * (emojis.length - 1)) + 1];
  });
  return result;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("machine")
    .setDescription("Play the slot machine")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of coins to bet")
        .setRequired(true)
    ),
  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const { machineLastUsed, balance } = profileData;

    const amount = interaction.options.getInteger("amount");

    if (amount <= 0 || amount > balance) {
      return await interaction.reply("Invalid amount of coins.");
    }

    await interaction.deferReply();

    await profileModel.findOneAndUpdate(
      {
        userId: id,
      },
      {
        $inc: {
          balance: -amount,
        },
        $set: {
          machineLastUsed: Date.now(),
        },
      }
    );

    const winProbability = 0.25; // Probabilité de gagner est de 25%

    const emojis = ["🍒", "🍊", "🍇"];
    const result = generateResult(winProbability, emojis);

    const isWin = result.every((emoji) => emoji === result[0]);

    let machineEmbed = new EmbedBuilder();

    if (isWin) {
      await profileModel.findOneAndUpdate(
        {
          userId: id,
        },
        {
          $inc: {
            balance: amount * 2,
          },
        }
      );

      machineEmbed
        .setColor(0x00ff00)
        .setTitle("Slot machine result : **You WIN !**")
        .setDescription(
          `**Jackpot!**\n${result.join(" ")}\nYou **won +${amount} coins**.`
        );
    } else {
      machineEmbed
        .setColor(0xff0000)
        .setTitle("Slot machine result : **You LOST !**")
        .setDescription(
          `**No luck...**\n${result.join(" ")}\nYou **lost ${amount} coins**.`
        );
    }

    await interaction.editReply({ embeds: [machineEmbed] });
  },
};
