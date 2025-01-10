// src\gemini-connector.js
require('dotenv').config({ path: 'application.env' });
const https = require('https');
const { SocksProxyAgent } = require('socks-proxy-agent');

const proxyUrl = `socks5://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`;
const agent = new SocksProxyAgent(proxyUrl);

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  //path: `/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  agent: agent,
  rejectUnauthorized: false,
};

async function gemini_query(prompt) {

  const requestPayload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    safetySettings: [
      {category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE'},
      {category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE'},
      {category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE'},
      {category: 'HARM_CATEGORY_DANGEROUS_CONTENT',threshold: 'BLOCK_NONE'}
    ]
  };

  const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          }
          catch (error) {
            reject(new Error('Failed to parse response JSON: ' + error.message));
          }
        });
      });
  
      req.on('error', (error) => {
        reject(error);
      });

      req.write(JSON.stringify(requestPayload));
      req.end();
    });

  return result.candidates[0].content.parts[0].text;
}

module.exports = { gemini_query };