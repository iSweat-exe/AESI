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
    .setDescription("Jouer à la machine à sous")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Quantité de pièces à parier")
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const { balance, totalSpent } = profileData;

    const amount = interaction.options.getInteger("amount");

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
        .setTitle("Résultat machine à sous : **Vous GAGNEZ !**")
        .setDescription(
          `**Jackpot !**\n\n${result.join(" ")}\n\nVous **avez gagné +${montant} pièces**.`
        );
    } else {
      machineEmbed
        .setColor(0xff0000)
        .setTitle("Résultat machine à sous : **Vous avez PERDU !**")
        .setDescription(
          `**Pas de chance...**\n\n${result.join(" ")}\n\nVous avez **perdu ${amount} pièces**.`
        );
    }

    await interaction.editReply({ embeds: [machineEmbed] });
  },
};
