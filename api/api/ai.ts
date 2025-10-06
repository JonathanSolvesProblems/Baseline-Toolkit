import type { VercelRequest, VercelResponse } from '@vercel/node';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const token = process.env.GITHUB_TOKEN;
const endpoint = 'https://models.github.ai/inference';
const model = 'deepseek/DeepSeek-V3-0324';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!token) {
      throw new Error('GITHUB_TOKEN is not set in environment variables');
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const userPrompt = req.body?.prompt || 'Summarize the baseline report';

    const response = await client.path('/chat/completions').post({
      body: {
        messages: [
          { role: 'system', content: 'You are a helpful assistant that reviews Baseline reports.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
        model,
      },
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    res.status(200).json({ output: response.body.choices[0].message.content });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed', details: err.message });
  }
}
