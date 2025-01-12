// src\discord-commands\utility\jobs.js
const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { linkedin_query } = require('../../linkedin-connector');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jobs')
		.setDescription('Get job pushes! Usage: /jobs'),
	async execute(interaction) {
		try {
            const options = {
                keyword: 'software engineer',
                location: 'Hong Kong SAR',
                dateSincePosted: 'past Week',
                jobType: 'full time',
                remoteFilter: 'on site',
                salary: '0',
                experienceLevel: 'entry level',
                limit: '5',
                page: "0",
            };
			let jobs = await linkedin_query(options)

            jobs = jobs.filter(job => job.jobUrl); // must have job url

			const embeds = [];

            jobs.forEach(job => {
				const embed = new EmbedBuilder()
					.setTitle(job.position)
					.setDescription(`${job.company} - ${job.location}\n\n[Apply Here](${job.jobUrl})`)
					.setThumbnail(job.companyLogo)
					.addFields(
						{ name: 'Date Posted', value: job.date, inline: true },
						{ name: 'Salary', value: job.salary, inline: true },
						{ name: 'Time Ago', value: job.agoTime || 'Recently', inline: true }
					);

				embeds.push(embed);
			});

			await interaction.reply({ embeds });
		} catch (error) {
			console.error('Error:', error.message);
			await interaction.editReply('An error occurred.'); // Handle errors appropriately
		}
	},
};