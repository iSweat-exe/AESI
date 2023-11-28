const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("Report a bug or provide feedback")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Bug or Other")
        .setRequired(true)
        .addChoices(
          { name: "Bug", value: "bug" },
          { name: "Other", value: "other" }
        )
    )
    .addStringOption((option) =>
      option.setName("comment").setDescription("Your comment").setRequired(true)
    ),
  async execute(interaction) {
    const userId = interaction.user.id;

    const userReportCount = await profileModel.findOne({ userId });

    if (!userReportCount) {
      await profileModel.create({
        userId,
        reportCount: 1,
      });
    } else {
      await profileModel.findOneAndUpdate(
        { userId },
        { $inc: { reportCount: 1 } }
      );

      if (userReportCount.reportCount >= 10) {
        // Bannir l'utilisateur et envoyer un message dans la console
        await interaction.guild.members.ban(userId, {
          reason: "Exceeded report limit.",
        });

        console.log(`Banned: ${interaction.user.tag}`);
        return await interaction.reply(
          "You have been banned for exceeding the report limit (10 reports in 24 hours)."
        );
      }
    }

    const type = interaction.options.getString("type");
    const comment = interaction.options.getString("comment");
    const user = interaction.user;
    const developerId = "1138590489176707093";
    const developer = await interaction.client.users.fetch(developerId);

    // Envoyer le rapport au développeur avec l'information du nombre de rapports
    developer.send(`**Report :** ${type}\n**Information :** ${comment}\n**User:** ${user.tag}\n**Reports:** ${userReportCount.reportCount}/10`);

    await interaction.reply(
      `Your report has been submitted. Thank you for your feedback! (Reports: ${userReportCount.reportCount}/10)`
    );
  },
};
