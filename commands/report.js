const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("Signaler un bug ou fournir des commentaires")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Bug ou autre")
        .setRequired(true)
        .addChoices(
          { name: "Bug", value: "bug" },
          { name: "Autre", value: "autre" }
        )
    )
    .addStringOption((option) =>
      option.setName("comment").setDescription("Votre commentaire").setRequired(true)
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
          reason: "Limite de rapport dépassée.",
        });

        console.log(`Banned: ${interaction.user.tag}`);
        return await interaction.reply(
          "Vous avez été banni pour avoir dépassé la limite de signalement (10 signalements en 24 heures)."
        );
      }
    }

    const type = interaction.options.getString("type");
    const comment = interaction.options.getString("comment");
    const user = interaction.user;
    const developerId = "1138590489176707093";
    const developer = await interaction.client.users.fetch(developerId);

    // Envoyer le rapport au développeur avec l'information du nombre de rapports
    developer.send(`**Rapport :** ${type}\n**Informations :** ${commentaire}\n**Utilisateur :** ${user.tag}\n**Rapports :** ${userReportCount.reportCount} /10`);

    await interaction.reply(
      `Votre rapport a été soumis. Merci pour votre avis! (Rapports : ${userReportCount.reportCount}/10)`
    );
  },
};
