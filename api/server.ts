import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// AI setup
const token = process.env.GITHUB_TOKEN;
const endpoint = 'https://models.github.ai/inference';
const model = 'deepseek/DeepSeek-V3-0324';

app.post('/api/ai', async (req: any, res: any) => {
  try {
    if (!token) {
      throw new Error('GITHUB_TOKEN is not set in environment variables');
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const userPrompt = req.body.prompt || 'Summarize the baseline report';

    const response = await client.path('/chat/completions').post({
      body: {
        messages: [
          { role: 'system', content: 'You are a helpful assistant that reviews Baseline reports.' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        model,
      },
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    res.json({ output: response.body.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

app.listen(port, () => {
  console.log(`AI server listening at http://localhost:${port}`);
});
