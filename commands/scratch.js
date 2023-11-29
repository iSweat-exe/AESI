const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema");
const globalValues = require("../globalValues.json");

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
    .setName("scratch")
    .setDescription("Prix : 500 Coins"),
  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const { totalSpent, balance } = profileData;

    const amount = globalValues.fixedAmount;

    if (amount <= 0 || amount > balance) {
      return await interaction.reply("Quantité de pièces invalide.");
    }

    await interaction.deferReply();

    await profileModel.findOneAndUpdate(
      {
        userId: id,
      },
      {
        $inc: {
          balance: -amount,
          totalSpent: amount,
        },
      }
    );

    const winProbability = 0.01; // Probabilité de gagner est de 0.01%
    const emojis = ["||🍒||", "||🍊||", "||🍇||"];
    const result = generateResult(winProbability, emojis);
    const scratchGainAmount = globalValues.scratchGainAmount;

    const isWin = result.every((emoji) => emoji === result[0]);

    let machineEmbed = new EmbedBuilder();

    if (isWin) {
      await profileModel.findOneAndUpdate(
        {
          userId: id,
        },
        {
          $inc: {
            balance: scratchGainAmount,
          },
        }
      );

      machineEmbed
        .setColor(0x0000ff)
        .setTitle("**🎟️ Jeux à gratter 🎟️**")
        .setDescription(
          `**Cliquez sur ||*Exemple*|| pour voir le résultat**\n\n${result.join(
            " "
          )}\n\n||Vous gagnez .||`
        );
    } else {
      machineEmbed
        .setColor(0x0000ff)
        .setTitle("**🎟️ Scratch Games 🎟️**")
        .setDescription(
          `**Cliquez sur ||*Exemple*|| pour voir le résultat**\n\n${result.join(
            " "
          )}\n\n||Vous avez perdu.||`
        );
    }

    await interaction.editReply({ embeds: [machineEmbed] });
  },
};
