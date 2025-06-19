import express, { json, static as staticFiles } from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createServer() {
  const app = express();

  // Enable CORS for localhost
  app.use(
    cors({
      origin: [
        'http://localhost:3000', // sample-html-server
        'http://localhost:3001', // mock-api-server (self)
        'http://localhost:3002', // alternative mock-api port
        'http://localhost:8080', // common dev server port
        'http://localhost:8000', // alternative dev server port
        'http://localhost:5173', // Vite dev server
        'http://localhost:4173', // Vite preview server
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:8000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:4173',
        // Chrome Extension origins
        /^chrome-extension:\/\//,
        /^moz-extension:\/\//,
        // Any localhost port pattern
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
      ],
      exposedHeaders: ['Content-Length', 'Content-Type', 'X-Response-Time'],
      optionsSuccessStatus: 200,
    }),
  );

  // Parse JSON bodies
  app.use(json());

  // CORS debugging middleware
  app.use((req, res, next) => {
    const origin = req.get('Origin');
    if (origin && process.env.NODE_ENV !== 'production') {
      console.log(`CORS request from origin: ${origin}`);
    }
    next();
  });

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

  // OpenAPI Schema endpoint
  app.get('/openapi.yaml', (req, res) => {
    try {
      const openApiContent = readFileSync(join(__dirname, 'openapi.yaml'), 'utf8');
      res.setHeader('Content-Type', 'application/x-yaml');
      res.send(openApiContent);
    } catch (error) {
      res.status(404).json({ error: 'OpenAPI schema not found' });
    }
  });

  // Swagger UI endpoint
  app.get('/docs', (req, res) => {
    try {
      const swaggerHtml = readFileSync(join(__dirname, 'swagger-ui.html'), 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.send(swaggerHtml);
    } catch (error) {
      res.status(404).json({ error: 'Swagger UI not found' });
    }
  });

  // CORS test endpoint
  app.get('/cors-test', (req, res) => {
    res.json({
      message: 'CORS is working!',
      origin: req.get('Origin') || 'No origin header',
      timestamp: new Date().toISOString(),
      headers: {
        'access-control-allow-origin': res.get('Access-Control-Allow-Origin'),
        'access-control-allow-credentials': res.get('Access-Control-Allow-Credentials'),
      },
    });
  });

  // Root endpoint with API info
  app.get('/', (req, res) => {
    res.json({
      name: 'Mock API Server',
      description: 'OpenAI互換のモックAPIサーバー',
      version: '1.0.0',
      endpoints: {
        chat_completions: '/v1/chat/completions',
        health: '/health',
        docs: '/docs',
        openapi: '/openapi.yaml',
        cors_test: '/cors-test',
      },
      documentation: `http://localhost:${req.get('host')}/docs`,
      cors: 'Configured for localhost and Chrome extensions',
    });
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
    console.log('Available endpoints:');
    console.log(`  API Documentation: http://localhost:${PORT}/docs`);
    console.log(`  Health Check:      http://localhost:${PORT}/health`);
    console.log(`  OpenAPI Schema:    http://localhost:${PORT}/openapi.yaml`);
    console.log(`  Chat Completions:  http://localhost:${PORT}/v1/chat/completions`);
    console.log('');
    console.log(`🌐 Open API Documentation: http://localhost:${PORT}/docs`);
  });
}
