const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Shows the top 10 coins earners."),
  async execute(interaction, profileData) {
    await interaction.deferReply();

    const { username, id } = interaction.user;
    const { balance } = profileData;

    let leaderboardEmbed = new EmbedBuilder()
      .setTitle("**Top 10 coins earners**")
      .setColor(0x45d6fd)
      .setFooter({ text: `Your are not ranked yet` });

    const members = await profileModel
      .find()
      .sort({ balance: -1 })
      .catch((err) => console.log(err));

    const memberIdx = members.findIndex((member) => member.userId === id);

    leaderboardEmbed.setFooter({
      text: `${username}, you're rank #${memberIdx + 1} with ${balance}`,
    });

    const topTen = members.slice(0, 10);

    let desc = "";
    for (let i = 0; i < topTen.length; i++) {
      let { user } = await interaction.guild.members.fetch(topTen[i].userId);
      if (!user) return;
      let userBalance = topTen[i].balance;
      desc += `**${i + 1} ${user.username}:** ${userBalance} coins\n`;
    }
    if (desc !== "") {
      leaderboardEmbed.setDescription(desc);
    }

    await interaction.editReply({ embeds: [leaderboardEmbed] });
  },
};
