/**
 * @fileoverview エラーハンドリング機能のテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIErrorHandler, createAPIError, isRetryableError } from '../../lib/utils/error-handler';
import { APIErrorType } from '../../lib/client/api-types';

describe('APIErrorHandler', () => {
  let errorHandler: APIErrorHandler;

  beforeEach(() => {
    errorHandler = new APIErrorHandler();
  });

  describe('createAPIError', () => {
    it('should create APIError with basic properties', () => {
      const error = createAPIError(
        APIErrorType.AUTHENTICATION,
        'Invalid API key',
        401
      );

      expect(error.type).toBe(APIErrorType.AUTHENTICATION);
      expect(error.message).toBe('Invalid API key');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('APIError');
    });

    it('should create APIError with retry information', () => {
      const error = createAPIError(
        APIErrorType.RATE_LIMIT,
        'Rate limit exceeded',
        429,
        60
      );

      expect(error.type).toBe(APIErrorType.RATE_LIMIT);
      expect(error.retryAfter).toBe(60);
    });

    it('should create APIError with details', () => {
      const details = { code: 'insufficient_quota', param: null };
      const error = createAPIError(
        APIErrorType.QUOTA_EXCEEDED,
        'Quota exceeded',
        429,
        undefined,
        details
      );

      expect(error.details).toEqual(details);
    });
  });

  describe('isRetryableError', () => {
    it('should return true for retryable errors', () => {
      const retryableTypes = [
        APIErrorType.RATE_LIMIT,
        APIErrorType.NETWORK,
        APIErrorType.SERVER_ERROR
      ];

      retryableTypes.forEach(type => {
        const error = createAPIError(type, 'Test error');
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it('should return false for non-retryable errors', () => {
      const nonRetryableTypes = [
        APIErrorType.AUTHENTICATION,
        APIErrorType.INVALID_REQUEST,
        APIErrorType.QUOTA_EXCEEDED
      ];

      nonRetryableTypes.forEach(type => {
        const error = createAPIError(type, 'Test error');
        expect(isRetryableError(error)).toBe(false);
      });
    });
  });

  describe('handleError', () => {
    it('should classify HTTP errors correctly', () => {
      const testCases = [
        { status: 401, expectedType: APIErrorType.AUTHENTICATION },
        { status: 403, expectedType: APIErrorType.AUTHENTICATION },
        { status: 429, expectedType: APIErrorType.RATE_LIMIT },
        { status: 500, expectedType: APIErrorType.SERVER_ERROR },
        { status: 502, expectedType: APIErrorType.SERVER_ERROR },
        { status: 400, expectedType: APIErrorType.INVALID_REQUEST }
      ];

      testCases.forEach(({ status, expectedType }) => {
        const httpError = new Error('HTTP Error');
        (httpError as any).status = status;

        const apiError = errorHandler.handleError(httpError);
        expect(apiError.type).toBe(expectedType);
        expect(apiError.statusCode).toBe(status);
      });
    });

    it('should classify additional HTTP status codes', () => {
      const additionalTestCases = [
        { status: 422, expectedType: APIErrorType.INVALID_REQUEST },
        { status: 503, expectedType: APIErrorType.SERVER_ERROR },
        { status: 504, expectedType: APIErrorType.SERVER_ERROR },
        { status: 404, expectedType: APIErrorType.INVALID_REQUEST },
        { status: 418, expectedType: APIErrorType.INVALID_REQUEST }, // Client error
        { status: 599, expectedType: APIErrorType.SERVER_ERROR } // Server error
      ];

      additionalTestCases.forEach(({ status, expectedType }) => {
        const httpError = new Error('HTTP Error');
        (httpError as any).status = status;

        const apiError = errorHandler.handleError(httpError);
        expect(apiError.type).toBe(expectedType);
        expect(apiError.statusCode).toBe(status);
      });
    });

    it('should classify quota exceeded errors by message content', () => {
      const quotaError = new Error('You exceeded your current quota');
      (quotaError as any).status = 429;

      const apiError = errorHandler.handleError(quotaError);
      expect(apiError.type).toBe(APIErrorType.QUOTA_EXCEEDED);
      expect(apiError.statusCode).toBe(429);
    });

    it('should classify insufficient_quota errors', () => {
      const quotaError = new Error('insufficient_quota available');
      (quotaError as any).status = 429;

      const apiError = errorHandler.handleError(quotaError);
      expect(apiError.type).toBe(APIErrorType.QUOTA_EXCEEDED);
      expect(apiError.statusCode).toBe(429);
    });

    it('should handle errors with statusCode property instead of status', () => {
      const httpError = {
        message: 'HTTP Error',
        statusCode: 401
      };

      const apiError = errorHandler.handleError(httpError);
      expect(apiError.type).toBe(APIErrorType.AUTHENTICATION);
      expect(apiError.statusCode).toBe(401);
    });

    it('should handle errors with data in response property', () => {
      const httpError = new Error('HTTP Error');
      (httpError as any).status = 400;
      (httpError as any).response = {
        data: { error: { message: 'Invalid parameter', code: 'invalid_param' } }
      };

      const apiError = errorHandler.handleError(httpError);
      expect(apiError.type).toBe(APIErrorType.INVALID_REQUEST);
      expect(apiError.details).toEqual({ error: { message: 'Invalid parameter', code: 'invalid_param' } });
    });

    it('should handle network errors', () => {
      const networkError = new Error('Network request failed');
      networkError.name = 'NetworkError';

      const apiError = errorHandler.handleError(networkError);
      expect(apiError.type).toBe(APIErrorType.NETWORK);
    });

    it('should handle timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      const apiError = errorHandler.handleError(timeoutError);
      expect(apiError.type).toBe(APIErrorType.NETWORK);
    });

    it('should handle AbortError', () => {
      const abortError = new Error('The request was aborted');
      abortError.name = 'AbortError';

      const apiError = errorHandler.handleError(abortError);
      expect(apiError.type).toBe(APIErrorType.NETWORK);
    });

    it('should handle connection errors by code', () => {
      const connectionErrors = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'];
      
      connectionErrors.forEach(code => {
        const connectionError = new Error('Connection failed');
        (connectionError as any).code = code;

        const apiError = errorHandler.handleError(connectionError);
        expect(apiError.type).toBe(APIErrorType.NETWORK);
      });
    });

    it('should handle network errors by message content', () => {
      const networkMessages = [
        'network error occurred',
        'timeout while connecting',
        'connection refused',
        'request failed',
        'fetch error occurred'
      ];
      
      networkMessages.forEach(message => {
        const networkError = new Error(message);

        const apiError = errorHandler.handleError(networkError);
        expect(apiError.type).toBe(APIErrorType.NETWORK);
      });
    });

    it('should handle non-Error objects', () => {
      const plainObject = {
        message: 'Something went wrong',
        status: 500
      };

      const apiError = errorHandler.handleError(plainObject);
      expect(apiError.type).toBe(APIErrorType.SERVER_ERROR);
      expect(apiError.statusCode).toBe(500);
    });

    it('should handle null or undefined errors', () => {
      const nullError = errorHandler.handleError(null);
      expect(nullError.type).toBe(APIErrorType.UNKNOWN);
      expect(nullError.message).toBe('An unknown error occurred');

      const undefinedError = errorHandler.handleError(undefined);
      expect(undefinedError.type).toBe(APIErrorType.UNKNOWN);
      expect(undefinedError.message).toBe('An unknown error occurred');
    });

    it('should extract retry-after header from rate limit errors', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;
      (rateLimitError as any).headers = {
        'retry-after': '60'
      };

      const apiError = errorHandler.handleError(rateLimitError);
      expect(apiError.type).toBe(APIErrorType.RATE_LIMIT);
      expect(apiError.retryAfter).toBe(60);
    });

    it('should extract retry-after header with capital letters', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;
      (rateLimitError as any).headers = {
        'Retry-After': '120'
      };

      const apiError = errorHandler.handleError(rateLimitError);
      expect(apiError.type).toBe(APIErrorType.RATE_LIMIT);
      expect(apiError.retryAfter).toBe(120);
    });

    it('should handle invalid retry-after header values', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;
      (rateLimitError as any).headers = {
        'retry-after': 'invalid-number'
      };

      const apiError = errorHandler.handleError(rateLimitError);
      expect(apiError.type).toBe(APIErrorType.RATE_LIMIT);
      expect(apiError.retryAfter).toBeUndefined();
    });

    it('should handle missing retry-after header', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;
      (rateLimitError as any).headers = {};

      const apiError = errorHandler.handleError(rateLimitError);
      expect(apiError.type).toBe(APIErrorType.RATE_LIMIT);
      expect(apiError.retryAfter).toBeUndefined();
    });

    it('should handle errors without headers', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;

      const apiError = errorHandler.handleError(rateLimitError);
      expect(apiError.type).toBe(APIErrorType.RATE_LIMIT);
      expect(apiError.retryAfter).toBeUndefined();
    });

    it('should handle unknown errors', () => {
      const unknownError = new Error('Something went wrong');

      const apiError = errorHandler.handleError(unknownError);
      expect(apiError.type).toBe(APIErrorType.UNKNOWN);
      expect(apiError.originalError).toBe(unknownError);
    });
  });

  describe('shouldRetry', () => {
    it('should return true for retryable errors within retry limit', () => {
      const error = createAPIError(APIErrorType.RATE_LIMIT, 'Rate limit');
      const result = errorHandler.shouldRetry(error, 2, 5);
      expect(result).toBe(true);
    });

    it('should return false when max retries exceeded', () => {
      const error = createAPIError(APIErrorType.RATE_LIMIT, 'Rate limit');
      const result = errorHandler.shouldRetry(error, 5, 5);
      expect(result).toBe(false);
    });

    it('should return false for non-retryable errors', () => {
      const error = createAPIError(APIErrorType.AUTHENTICATION, 'Auth error');
      const result = errorHandler.shouldRetry(error, 1, 5);
      expect(result).toBe(false);
    });
  });

  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      const delay1 = errorHandler.calculateBackoffDelay(0, 1000, 10000, 2, false);
      const delay2 = errorHandler.calculateBackoffDelay(1, 1000, 10000, 2, false);
      const delay3 = errorHandler.calculateBackoffDelay(2, 1000, 10000, 2, false);

      expect(delay1).toBe(1000);
      expect(delay2).toBe(2000);
      expect(delay3).toBe(4000);
    });

    it('should respect maximum delay', () => {
      const delay = errorHandler.calculateBackoffDelay(10, 1000, 5000, 2, false);
      expect(delay).toBeLessThanOrEqual(5000);
    });

    it('should add jitter to prevent thundering herd', () => {
      const delays = Array.from({ length: 10 }, () =>
        errorHandler.calculateBackoffDelay(1, 1000, 10000, 2)
      );

      // Not all delays should be exactly the same due to jitter
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });
  });

  describe('sanitizeErrorForLogging', () => {
    it('should remove sensitive information from errors', () => {
      const error = createAPIError(
        APIErrorType.AUTHENTICATION,
        'Invalid API key: sk-proj-1234567890abcdefghijklmnopqrstuvwxyz1234567890',
        401,
        undefined,
        { 
          apiKey: 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz1234567890',
          userToken: 'sensitive-token',
          publicInfo: 'safe-data'
        }
      );

      const sanitized = errorHandler.sanitizeErrorForLogging(error);

      expect(sanitized.message).toContain('[REDACTED]');
      expect(sanitized.message).not.toContain('sk-proj-1234567890abcdefghijklmnopqrstuvwxyz1234567890');
      expect(sanitized.details.apiKey).toBe('[REDACTED]');
      expect(sanitized.details.userToken).toBe('[REDACTED]');
      expect(sanitized.details.publicInfo).toBe('safe-data');
    });

    it('should preserve non-sensitive information', () => {
      const error = createAPIError(
        APIErrorType.RATE_LIMIT,
        'Rate limit exceeded for requests',
        429
      );

      const sanitized = errorHandler.sanitizeErrorForLogging(error);
      expect(sanitized.message).toBe('Rate limit exceeded for requests');
      expect(sanitized.type).toBe(APIErrorType.RATE_LIMIT);
      expect(sanitized.statusCode).toBe(429);
    });

    it('should sanitize different API key formats', () => {
      const apiKeyFormats = [
        'sk-1234567890abcdefghijklmnopqrstuvwxyz',
        'Bearer abc123def456ghi789',
        'api_key="test-key-123"',
        'token: sensitive_token_value',
        'password="secret123"'
      ];

      apiKeyFormats.forEach(sensitiveText => {
        const error = createAPIError(
          APIErrorType.AUTHENTICATION,
          `Error with ${sensitiveText}`,
          401
        );

        const sanitized = errorHandler.sanitizeErrorForLogging(error);
        expect(sanitized.message).toContain('[REDACTED]');
        expect(sanitized.message).not.toContain(sensitiveText);
      });
    });

    it('should handle nested object sanitization', () => {
      const error = createAPIError(
        APIErrorType.AUTHENTICATION,
        'Auth error',
        401,
        undefined,
        {
          user: {
            apiKey: 'sk-secret123',
            metadata: {
              token: 'nested-token',
              publicId: 'user-123'
            }
          },
          config: {
            password: 'secret-password',
            timeout: 5000
          }
        }
      );

      const sanitized = errorHandler.sanitizeErrorForLogging(error);
      expect(sanitized.details.user.apiKey).toBe('[REDACTED]');
      expect(sanitized.details.user.metadata.token).toBe('[REDACTED]');
      expect(sanitized.details.user.metadata.publicId).toBe('user-123');
      expect(sanitized.details.config.password).toBe('[REDACTED]');
      expect(sanitized.details.config.timeout).toBe(5000);
    });

    it('should handle null and undefined details', () => {
      const errorWithNull = createAPIError(
        APIErrorType.NETWORK,
        'Network error',
        undefined,
        undefined,
        null
      );

      const sanitizedNull = errorHandler.sanitizeErrorForLogging(errorWithNull);
      expect(sanitizedNull.details).toBeNull();

      const errorWithUndefined = createAPIError(
        APIErrorType.NETWORK,
        'Network error'
      );

      const sanitizedUndefined = errorHandler.sanitizeErrorForLogging(errorWithUndefined);
      expect(sanitizedUndefined.details).toBeUndefined();
    });

    it('should handle non-object details', () => {
      const error = createAPIError(
        APIErrorType.NETWORK,
        'Network error',
        undefined,
        undefined,
        'string-details'
      );

      const sanitized = errorHandler.sanitizeErrorForLogging(error);
      expect(sanitized.details).toBe('string-details');
    });

    it('should handle case-insensitive sensitive key detection', () => {
      const error = createAPIError(
        APIErrorType.AUTHENTICATION,
        'Auth error',
        401,
        undefined,
        {
          ApiKey: 'should-be-redacted',
          API_KEY: 'should-be-redacted-too',
          userTOKEN: 'also-redacted',
          PASSWORD: 'redacted-password',
          SECRET: 'redacted-secret',
          normalField: 'should-remain'
        }
      );

      const sanitized = errorHandler.sanitizeErrorForLogging(error);
      expect(sanitized.details.ApiKey).toBe('[REDACTED]');
      expect(sanitized.details.API_KEY).toBe('[REDACTED]');
      expect(sanitized.details.userTOKEN).toBe('[REDACTED]');
      expect(sanitized.details.PASSWORD).toBe('[REDACTED]');
      expect(sanitized.details.SECRET).toBe('[REDACTED]');
      expect(sanitized.details.normalField).toBe('should-remain');
    });
  });
});