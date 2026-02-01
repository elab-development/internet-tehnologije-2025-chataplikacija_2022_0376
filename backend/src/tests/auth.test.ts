import request from 'supertest';
import app from '../server';

describe('API Testovi', () => {
  // 1. UNIT TEST - Provera logike za validaciju 
  describe('Unit Test: Validacija email-a', () => {
    it('Treba da prepozna neispravan email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'pogresan-email' });
      
      expect(res.statusCode).toBe(400); // Očekujemo grešku
    });
  });

  // 2. INTEGRATION TEST - Provera rute za Health Check
  describe('Integration Test: Server Status', () => {
    it('Treba da potvrdi da je server operativan na /health ruti', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
    });
  });
});