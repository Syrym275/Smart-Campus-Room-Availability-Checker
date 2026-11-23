import { describe, it, expect } from 'vitest';
import availabilitySource from './availability.ts?raw';

describe('module boundaries', () => {
  it('availability.ts (the rules) does not import from the explanation layer', () => {
    expect(availabilitySource).not.toMatch(/from\s+['"]@\/lib\/explain/);
  });
});
