// server/routes.test.js
import { jest } from '@jest/globals'; // <-- ADD THIS LINE
import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes.js';

// Mock the storage layer
const mockStorage = {
  getParcels: jest.fn(() => Promise.resolve([])),
  getMetrics: jest.fn(() => Promise.resolve({ totalParcels: 0 })),
  // Add mocks for other storage methods as you write more tests
};

const app = express();
app.use(express.json());
registerRoutes(app, mockStorage); // Pass the mock storage

describe('API Endpoints', () => {
  describe('GET /api/parcels', () => {
    it('should return a 200 OK status and an array', async () => {
      const res = await request(app).get('/api/parcels');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/metrics', () => {
    it('should return a 200 OK status and a metrics object', async () => {
      const res = await request(app).get('/api/metrics');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalParcels');
    });
  });
});