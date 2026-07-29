import { normalizeTenantName } from './tenant-name';

describe('normalizeTenantName', () => {
  it('normalizes casing, whitespace, and Unicode compatibility forms', () => {
    expect(normalizeTenantName('  Ｎorth REGION  ')).toBe('north region');
  });
});
