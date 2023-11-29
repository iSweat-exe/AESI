const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Affiche les 10 plus riche du serveur."),
  async execute(interaction, profileData) {
    await interaction.deferReply();

    const { username, id } = interaction.user;
    const { balance } = profileData;

    let leaderboardEmbed = new EmbedBuilder()
      .setTitle("**Top 10 des plus riches**")
      .setColor(0x45d6fd)
      .setFooter({ text: `Vous n'êtes pas encore classé` });

    const members = await profileModel
      .find()
      .sort({ balance: -1 })
      .catch((err) => console.log(err));

    const memberIdx = members.findIndex((member) => member.userId === id);

    leaderboardEmbed.setFooter({
      text: `${username}, vous êtes au rang #${memberIdx + 1} avec ${balance} pieces`,
    });

    const topTen = members.slice(0, 10);

    let desc = "";
    for (let i = 0; i < topTen.length; i++) {
      let member;
      try {
        member = await interaction.guild.members.fetch(topTen[i].userId);
      } catch (error) {
        console.error(`Error fetching member with ID ${topTen[i].userId}: ${error.message}`);
        await profileModel.findOneAndDelete({ userId: topTen[i].userId });
        continue;
      }

      if (!member) continue;

      let user = member.user;
      let userBalance = topTen[i].balance;
      desc += `**${i + 1} ${user.username}:** ${userBalance} pieces\n`;
    }

    if (desc !== "") {
      leaderboardEmbed.setDescription(desc);
    }

    await interaction.editReply({ embeds: [leaderboardEmbed] });
  },
};
