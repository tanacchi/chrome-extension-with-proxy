import express, { json } from 'express';
import cors from 'cors';

export function createServer() {
  const app = express();

  // Enable CORS for all routes
  app.use(cors());

  // Parse JSON bodies
  app.use(json());

  // Mock OpenAI Chat Completions API
  app.post('/v1/chat/completions', (req, res) => {
    const { model, messages } = req.body;

    // Validate required fields
    if (!model || !messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: {
          message: 'Invalid request: model and messages are required',
          type: 'invalid_request_error',
          code: 'invalid_request',
        },
      });
    }

    // Extract user input for mock analysis
    const userMessage = messages.find(msg => msg.role === 'user');
    const userInput = userMessage ? userMessage.content : '';

    // Use first 30 characters as specified
    const first30Chars = userInput.substring(0, 30);

    // Generate mock analysis based on input
    const mockAnalysis = generateMockAnalysis(first30Chars);

    // Mock response following OpenAI API format
    const response = {
      id: `chatcmpl-${generateId()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: mockAnalysis,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: calculateTokens(messages),
        completion_tokens: calculateTokens([{ content: mockAnalysis }]),
        total_tokens: calculateTokens(messages) + calculateTokens([{ content: mockAnalysis }]),
      },
    };

    res.json(response);
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}

function generateMockAnalysis(input) {
  const analyses = [
    `「${input}」のデータを分析すると、これらは果物の名前のようです。色とりどりで栄養価の高い食材として注目されます。`,
    `入力データ「${input}」から、多様性と健康的な選択肢が見えてきます。バランスの取れた組み合わせが特徴的です。`,
    `「${input}」の分析結果：これらの項目は相互に補完し合う関係にあり、全体として調和の取れた構成となっています。`,
    `データ「${input}」について：各要素が独自の特性を持ちながら、共通のテーマでまとまっている興味深いパターンです。`,
  ];

  return analyses[Math.floor(Math.random() * analyses.length)];
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function calculateTokens(messages) {
  // Simple mock token calculation (roughly 4 chars = 1 token)
  const totalChars = messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0);
  return Math.ceil(totalChars / 4);
}

// Start server if this file is run directly
/* eslint-env node */
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const PORT = process.env.PORT || 3002;

  app.listen(PORT, () => {
    console.log(`Mock API Server running on http://localhost:${PORT}`);
    console.log('OpenAI-compatible endpoints:');
    console.log(`  POST http://localhost:${PORT}/v1/chat/completions`);
    console.log(`  GET  http://localhost:${PORT}/health`);
  });
}
