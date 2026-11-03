import { describe, it, expect } from 'vitest';

describe('Environment validation', () => {
  it('should validate required environment variables', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
