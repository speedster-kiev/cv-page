import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('skeleton smoke test', () => {
  it('builds dist/index.html', () => {
    expect(existsSync('dist/index.html')).toBe(true);
  });
});
