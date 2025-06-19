/**
 * @fileoverview OpenAI APIクライアントのテスト
 */

import { APIErrorType } from '../../lib/client/api-types';
import { OpenAIClient } from '../../lib/client/openai-client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ChatCompletionRequest, ChatCompletionResponse, ClientConfig } from '../../lib/client/api-types';

// モックレスポンス
const mockChatCompletionResponse: ChatCompletionResponse = {
  id: 'chatcmpl-123',
  object: 'chat.completion',
  created: 1677652288,
  model: 'gpt-4o',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'Hello! How can I help you today?',
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 9,
    completion_tokens: 12,
    total_tokens: 21,
  },
};

const mockRequest: ChatCompletionRequest = {
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello, how are you?' }],
  max_tokens: 100,
  temperature: 0.7,
};

describe('OpenAIClient', () => {
  let client: OpenAIClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    const config: ClientConfig = {
      apiKey: 'test-api-key',
      timeout: 5000,
    };

    client = new OpenAIClient(config);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      const config: ClientConfig = {
        apiKey: 'test-key',
        baseURL: 'https://custom-api.example.com',
        timeout: 10000,
      };

      const customClient = new OpenAIClient(config);
      expect(customClient).toBeInstanceOf(OpenAIClient);
    });

    it('should throw error if API key is missing', () => {
      expect(() => {
        new OpenAIClient({ apiKey: '' });
      }).toThrow('API key is required');
    });

    it('should throw error if API key is whitespace only', () => {
      expect(() => {
        new OpenAIClient({ apiKey: '   ' });
      }).toThrow('API key is required');
    });

    it('should throw error if API key is undefined', () => {
      expect(() => {
        new OpenAIClient({ apiKey: undefined as any });
      }).toThrow('API key is required');
    });

    it('should use default values for optional config', () => {
      const config: ClientConfig = {
        apiKey: 'test-key',
      };

      expect(() => new OpenAIClient(config)).not.toThrow();
    });
  });

  describe('createChatCompletion', () => {
    it('should make successful API call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockChatCompletionResponse,
      });

      const response = await client.createChatCompletion(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockRequest),
        }),
      );

      expect(response).toEqual(mockChatCompletionResponse);
    });

    it('should handle authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            message: 'Invalid API key',
            type: 'invalid_request_error',
          },
        }),
      });

      await expect(client.createChatCompletion(mockRequest)).rejects.toMatchObject({
        type: APIErrorType.AUTHENTICATION,
        statusCode: 401,
      });
    });

    it('should handle rate limit errors with retry-after', async () => {
      const mockHeaders = new Map([['retry-after', '60']]);
      mockHeaders.entries = function* () {
        yield ['retry-after', '60'];
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: mockHeaders,
        json: async () => ({
          error: {
            message: 'Rate limit exceeded',
            type: 'rate_limit_error',
          },
        }),
      });

      await expect(client.createChatCompletion(mockRequest)).rejects.toMatchObject({
        type: APIErrorType.RATE_LIMIT,
        statusCode: 429,
        retryAfter: 60,
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

      await expect(client.createChatCompletion(mockRequest)).rejects.toMatchObject({
        type: APIErrorType.NETWORK,
      });
    });

    it('should handle quota exceeded errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: {
            message: 'You exceeded your current quota',
            type: 'insufficient_quota',
          },
        }),
      });

      await expect(client.createChatCompletion(mockRequest)).rejects.toMatchObject({
        type: APIErrorType.QUOTA_EXCEEDED,
        statusCode: 429,
      });
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: {
            message: 'Internal server error',
            type: 'server_error',
          },
        }),
      });

      await expect(client.createChatCompletion(mockRequest)).rejects.toMatchObject({
        type: APIErrorType.SERVER_ERROR,
        statusCode: 500,
      });
    });

    it('should handle invalid request errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: 'Invalid request parameters',
            type: 'invalid_request_error',
          },
        }),
      });

      await expect(client.createChatCompletion(mockRequest)).rejects.toMatchObject({
        type: APIErrorType.INVALID_REQUEST,
        statusCode: 400,
      });
    });

    it('should handle malformed JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(client.createChatCompletion(mockRequest)).rejects.toMatchObject({
        type: APIErrorType.SERVER_ERROR,
        statusCode: 500,
      });
    });

    it('should handle timeout', async () => {
      const timeoutClient = new OpenAIClient({
        apiKey: 'test-key',
        timeout: 100,
      });

      mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 200)));

      await expect(timeoutClient.createChatCompletion(mockRequest)).rejects.toThrow();
    });

    it('should validate request parameters', async () => {
      const invalidRequest = {
        model: 'invalid-model' as any,
        messages: [],
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow();
    });

    it('should include user agent in headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockChatCompletionResponse,
      });

      await client.createChatCompletion(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('chrome-extension-ai-api'),
          }),
        }),
      );
    });
  });

  describe('createChatCompletionStream', () => {
    it('should handle streaming responses', async () => {
      const streamData = [
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"gpt-4o","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}\n\n',
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652289,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
        'data: [DONE]\n\n',
      ];

      const mockStream = new ReadableStream({
        start(controller) {
          streamData.forEach(chunk => {
            controller.enqueue(new TextEncoder().encode(chunk));
          });
          controller.close();
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: mockStream,
      });

      const streamRequest = { ...mockRequest, stream: true };
      const chunks = [];

      for await (const chunk of client.createChatCompletionStream(streamRequest)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2); // Excluding [DONE]
      expect(chunks[0].choices[0].delta.role).toBe('assistant');
      expect(chunks[1].choices[0].delta.content).toBe('Hello');
    });

    it('should handle streaming errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Stream failed'));

      const streamRequest = { ...mockRequest, stream: true };

      const iterator = client.createChatCompletionStream(streamRequest);

      await expect(iterator.next()).rejects.toThrow();
    });

    it('should handle empty streaming response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: null,
      });

      const streamRequest = { ...mockRequest, stream: true };

      await expect(async () => {
        for await (const chunk of client.createChatCompletionStream(streamRequest)) {
          // Should not reach here
        }
      }).rejects.toThrow('Response body is null');
    });

    it('should handle malformed JSON in stream', async () => {
      const streamData = [
        'data: {"invalid":json}\n\n',
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652289,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
        'data: [DONE]\n\n',
      ];

      const mockStream = new ReadableStream({
        start(controller) {
          streamData.forEach(chunk => {
            controller.enqueue(new TextEncoder().encode(chunk));
          });
          controller.close();
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: mockStream,
      });

      const streamRequest = { ...mockRequest, stream: true };
      const chunks = [];
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      for await (const chunk of client.createChatCompletionStream(streamRequest)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1); // Only valid chunk
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse SSE data:', 'data: {"invalid":json}');

      consoleSpy.mockRestore();
    });

    it('should handle empty lines in stream', async () => {
      const streamData = [
        '\n',
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652289,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
        '\n\n',
        'data: [DONE]\n\n',
      ];

      const mockStream = new ReadableStream({
        start(controller) {
          streamData.forEach(chunk => {
            controller.enqueue(new TextEncoder().encode(chunk));
          });
          controller.close();
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: mockStream,
      });

      const streamRequest = { ...mockRequest, stream: true };
      const chunks = [];

      for await (const chunk of client.createChatCompletionStream(streamRequest)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
    });

    it('should handle non-data lines in stream', async () => {
      const streamData = [
        ': this is a comment\n',
        'event: message\n',
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652289,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
        'data: [DONE]\n\n',
      ];

      const mockStream = new ReadableStream({
        start(controller) {
          streamData.forEach(chunk => {
            controller.enqueue(new TextEncoder().encode(chunk));
          });
          controller.close();
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: mockStream,
      });

      const streamRequest = { ...mockRequest, stream: true };
      const chunks = [];

      for await (const chunk of client.createChatCompletionStream(streamRequest)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
    });
  });

  describe('healthCheck', () => {
    it('should return true for successful health check', async () => {
      mockFetch.mockImplementationOnce(async () => {
        // 小さな遅延を追加してレスポンス時間をテスト
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          ok: true,
          status: 200,
          json: async () => ({ object: 'list', data: [] }),
        };
      });

      const result = await client.healthCheck();
      expect(result.healthy).toBe(true);
      expect(result.responseTime).toBeGreaterThan(0);
    });

    it('should return false for failed health check', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.healthCheck();
      expect(result.healthy).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should include response time', async () => {
      mockFetch.mockImplementationOnce(async () => {
        // 小さな遅延を追加してレスポンス時間を確保
        await new Promise(resolve => setTimeout(resolve, 1));
        return {
          ok: true,
          status: 200,
          json: async () => ({ object: 'list', data: [] }),
        };
      });

      const result = await client.healthCheck();
      expect(typeof result.responseTime).toBe('number');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('request validation', () => {
    it('should validate model parameter', async () => {
      const invalidRequest = {
        ...mockRequest,
        model: 'invalid-model' as any,
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow('Invalid model');
    });

    it('should validate messages array', async () => {
      const invalidRequest = {
        ...mockRequest,
        messages: [],
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow('Messages array cannot be empty');
    });

    it('should validate temperature range', async () => {
      const invalidRequest = {
        ...mockRequest,
        temperature: 5.0,
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow('Temperature must be between 0 and 2');
    });

    it('should validate negative temperature', async () => {
      const invalidRequest = {
        ...mockRequest,
        temperature: -1.0,
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow('Temperature must be between 0 and 2');
    });

    it('should validate top_p range', async () => {
      const invalidRequest = {
        ...mockRequest,
        top_p: 1.5,
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow('Top P must be between 0 and 1');
    });

    it('should validate negative top_p', async () => {
      const invalidRequest = {
        ...mockRequest,
        top_p: -0.1,
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow('Top P must be between 0 and 1');
    });

    it('should validate max_tokens minimum value', async () => {
      const invalidRequest = {
        ...mockRequest,
        max_tokens: 0,
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow('Max tokens must be greater than 0');
    });

    it('should validate presence_penalty range', async () => {
      const invalidRequest = {
        ...mockRequest,
        presence_penalty: 3.0,
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow(
        'Presence penalty must be between -2 and 2',
      );
    });

    it('should validate negative presence_penalty range', async () => {
      const invalidRequest = {
        ...mockRequest,
        presence_penalty: -3.0,
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow(
        'Presence penalty must be between -2 and 2',
      );
    });

    it('should validate frequency_penalty range', async () => {
      const invalidRequest = {
        ...mockRequest,
        frequency_penalty: 2.5,
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow(
        'Frequency penalty must be between -2 and 2',
      );
    });

    it('should validate frequency_penalty negative range', async () => {
      const invalidRequest = {
        ...mockRequest,
        frequency_penalty: -2.5,
      };

      await expect(client.createChatCompletion(invalidRequest)).rejects.toThrow(
        'Frequency penalty must be between -2 and 2',
      );
    });

    it('should accept valid request parameters', async () => {
      const validRequest = {
        ...mockRequest,
        temperature: 1.0,
        top_p: 0.9,
        max_tokens: 150,
        presence_penalty: 0.5,
        frequency_penalty: -0.5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockChatCompletionResponse,
      });

      await expect(client.createChatCompletion(validRequest)).resolves.toEqual(mockChatCompletionResponse);
    });
  });

  describe('request headers', () => {
    it('should include all required headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockChatCompletionResponse,
      });

      await client.createChatCompletion(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json',
            'User-Agent': expect.any(String),
          }),
        }),
      );
    });

    it('should use custom user agent if provided', async () => {
      const customClient = new OpenAIClient({
        apiKey: 'test-key',
        userAgent: 'custom-agent/1.0',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockChatCompletionResponse,
      });

      await customClient.createChatCompletion(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'custom-agent/1.0',
          }),
        }),
      );
    });
  });
});
