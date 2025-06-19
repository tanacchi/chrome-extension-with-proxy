import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from './server.js';

describe('Sample HTML Server', () => {
  let app;
  let server;

  beforeAll(() => {
    app = createServer();
    server = app.listen(0); // Use random port for testing
  });

  afterAll(() => {
    server.close();
  });

  describe('GET /', () => {
    it('should return HTML page with 3x3 table', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
      expect(response.text).toContain('<table');
      expect(response.text).toContain('ai-target-table-table');
    });

    it('should have proper table structure with 3 data rows and 3 columns', async () => {
      const response = await request(app).get('/');
      
      // Check for tbody
      expect(response.text).toContain('<tbody>');
      
      // Check for 4 total rows (1 header + 3 data rows)
      const trMatches = response.text.match(/<tr[^>]*>/g);
      expect(trMatches).toHaveLength(4);
      
      // Check for 9 td elements (3 data rows × 3 columns, excluding header th)
      const tdMatches = response.text.match(/<td[^>]*>/g);
      expect(tdMatches).toHaveLength(9);
      
      // Check for 3 th elements (header row)
      const thMatches = response.text.match(/<th\s[^>]*>|<th>/g);
      expect(thMatches).toHaveLength(3);
    });

    it('should contain sample data in the second column', async () => {
      const response = await request(app).get('/');
      
      expect(response.text).toContain('りんご');
      expect(response.text).toContain('バナナ');
      expect(response.text).toContain('オレンジ');
    });
  });

  describe('CORS headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app).get('/');
      
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });
});