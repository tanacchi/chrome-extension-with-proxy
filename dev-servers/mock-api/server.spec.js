import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from './server.js';

describe('Mock API Server', () => {
  let app;
  let server;

  beforeAll(() => {
    app = createServer();
    server = app.listen(0); // Use random port for testing
  });

  afterAll(() => {
    server.close();
  });

  describe('POST /v1/chat/completions', () => {
    it('should return OpenAI-compatible response format', async () => {
      const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze the following table data and provide insights.'
          },
          {
            role: 'user',
            content: 'Data: りんご, バナナ, オレンジ'
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      };

      const response = await request(app)
        .post('/v1/chat/completions')
        .send(requestBody)
        .expect(200);

      // Check OpenAI response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('object', 'chat.completion');
      expect(response.body).toHaveProperty('created');
      expect(response.body).toHaveProperty('model');
      expect(response.body).toHaveProperty('choices');
      expect(response.body).toHaveProperty('usage');

      // Check choices structure
      expect(response.body.choices).toBeInstanceOf(Array);
      expect(response.body.choices).toHaveLength(1);
      
      const choice = response.body.choices[0];
      expect(choice).toHaveProperty('index', 0);
      expect(choice).toHaveProperty('message');
      expect(choice).toHaveProperty('finish_reason', 'stop');
      
      // Check message structure
      expect(choice.message).toHaveProperty('role', 'assistant');
      expect(choice.message).toHaveProperty('content');
      expect(typeof choice.message.content).toBe('string');

      // Check usage structure
      expect(response.body.usage).toHaveProperty('prompt_tokens');
      expect(response.body.usage).toHaveProperty('completion_tokens');
      expect(response.body.usage).toHaveProperty('total_tokens');
    });

    it('should use first 30 characters of user input in response', async () => {
      const longInput = 'りんご, バナナ, オレンジ, ぶどう, いちご, メロン, すいか';
      const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: longInput
          }
        ]
      };

      const response = await request(app)
        .post('/v1/chat/completions')
        .send(requestBody)
        .expect(200);

      const responseContent = response.body.choices[0].message.content;
      const first30Chars = longInput.substring(0, 30);
      
      expect(responseContent).toContain(first30Chars);
    });

    it('should return error for invalid request', async () => {
      const invalidRequest = {
        // Missing required fields
      };

      const response = await request(app)
        .post('/v1/chat/completions')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('type');
    });
  });

  describe('CORS headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .post('/v1/chat/completions')
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'test' }]
        });
      
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });
});