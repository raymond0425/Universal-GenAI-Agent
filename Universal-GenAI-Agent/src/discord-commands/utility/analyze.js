// src\discord-commands\utility\analyze.js
const { SlashCommandBuilder } = require('discord.js');
const webScraper = require('../../web-scraper');
const { gemini_query } = require('../../gemini-connector');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('analyze')
		.setDescription('Analyze any website! Usage: /analyze <url>')
		.addStringOption(option =>
			option.setName('url')
				.setRequired(true)
				.setDescription('The url you want to analyze')),
	async execute(interaction) {
		await interaction.deferReply();
		
		const urlOption  = interaction.options._hoistedOptions.find(option => option.name === 'url');
		var url = urlOption ? urlOption.value.trim() : null;

		// Check if the URL already has a protocol
		if (!/^https?:\/\//i.test(url)) {
			// Prepend 'http://' if it doesn't have a protocol
			url = 'http://' + url;
		}

		console.log(url);

		try {
			const webContent = await webScraper(url);
						
			const prompt =
`
I want you to help me summarize a web page.
Of the following web content, I want you to first give me a point-form summary of the content (5 bullet points),
then suggest 3 questions for the user to potentially ask so that their productivity can be boosted as they quickly understand the content.
I want your response strictly in the following format:
**Summarized points**:
*
*
*
*
*

**Suggested questions**:
:one:
\n:two:
\n:three:
In your response, do not include any other text other than the lines above.
The web content you need to summarize: ${webContent}

I want your response in English.`;
				
			const result = await gemini_query(prompt);
			console.log('Result from Gemini:\n', result);
			await interaction.editReply(result + '\n Click on the emoji :one:, :two: or :three: to ask the follow up question!');
			const message = await interaction.fetchReply();
			message.react('1️⃣')
				.then(() => message.react('2️⃣'))
				.then(() => message.react('3️⃣'))
				.catch(error => console.error('One of the emojis failed to react:', error));

			const collectorFilter = (reaction, user) => {
				return ['1️⃣', '2️⃣', '3️⃣'].includes(reaction.emoji.name) && user.id === interaction.user.id;
			};

			message.awaitReactions({ filter: collectorFilter, max: 1, time: 60_000, errors: ['time'] })
				.then(async collected => {
					const reaction = collected.first()
					console.log(reaction._emoji.name)
					const questions = extractQuestions(result);
					if (reaction._emoji.name == '1️⃣') {
						await handleFollowUp(webContent, message, questions[0]);
					} else if (reaction._emoji.name == '2️⃣') {
						await handleFollowUp(webContent, message, questions[1]);
					} else if (reaction._emoji.name == '3️⃣') {
						await handleFollowUp(webContent, message, questions[2]);
					}
				})
				.catch(collected => {
					// message.reply('You reacted with neither :one:, :two:, or :three: or time's up.');
				});
		} catch (error) {
			console.error('Error:', error.message);
			await interaction.editReply('An error occurred.'); // Handle errors appropriately
		}
	},
};

function extractQuestions(inputText) {
	const questions = inputText.match(/:(?:one|two|three):\s*(.*?)(?=\n|$)/g)
	  .map(question => {
		return question.replace(/^:(?:one|two|three):\s*/, '').trim();
	  });
	  
	return questions;
}

async function handleFollowUp(webContent, message, followUpQuestion) {
	message.channel.send(`**You asked the follow-up question:** ${followUpQuestion}`)

	const prompt =
`
After reading the web content, answer the question ${followUpQuestion} using the web content when applicable and/or with your existing knowledge. The web content: ${webContent}
I want your response in English. Answer the question in concise and easy-to-understand manner.`;

	const result = await gemini_query(prompt);

	message.channel.send(`
**Response for the question:**
${result}`)
}