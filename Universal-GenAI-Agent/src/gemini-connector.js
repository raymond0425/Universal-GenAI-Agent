require('dotenv').config({ path: 'application.env' });
const http = require('http');
const https = require('https');
const { SocksProxyAgent } = require('socks-proxy-agent');

const proxyUrl = `socks5://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`;
const agent = new SocksProxyAgent(proxyUrl);

const server = http.createServer((req, res) => {
  if (req.url === '/stream' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { webContent } = JSON.parse(body); // Parse JSON body
      run(webContent, res); // Call run with webContent
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  agent: agent,
  rejectUnauthorized: false,
};

async function run(webContent, res) {

  const prompt = "Can you perform web search?" // for testing

  // const prompt = `
                // I want you to help me summarize a web page.
                // Of the following web content, I want you to first give me a point-form summary of the content (5 bullet points),
                // then suggest 3 questions for the user to potentially ask so that their productivity can be boosted as they quickly understand the content.
                // I want your response strictly in the following format:
                // 1.
                // 2.
                // 3.
                // 4.
                // 5.
                // Q1:
                // Q2:
                // Q3:
                // In your response, do not include any other text other than the lines above.
                // The web content you need to summarize: ${webContent}
                // I want your response in ${process.env.RESPONSE_LANGUAGE}.`;

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

  res.writeHead(200, { 'Content-Type': 'text/plain' });

  const reqApi = https.request(options, (apiRes) => {
    apiRes.on('data', (chunk) => {
      try {
        const message = JSON.parse(chunk.toString().replace(/^data: /, ''));
        const content = message.candidates[0].content.parts[0].text
        process.stdout.write(content);
        res.write(content);
      } catch (e) {
        console.error("Unsupported data format received!", e.message, chunk.toString());
      }
    });
    apiRes.on('end', () => {
      res.end();
    });
  });

  reqApi.on('error', (error) => {
    console.error('Request failed:', error.message);
    res.end();
  });

  reqApi.on('end', () => {
    res.end();
  });

  reqApi.write(JSON.stringify(requestPayload));
  reqApi.end();
}

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
