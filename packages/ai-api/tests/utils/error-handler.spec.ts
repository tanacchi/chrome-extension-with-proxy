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
  });
});