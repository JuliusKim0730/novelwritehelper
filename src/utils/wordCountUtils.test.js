import { describe, expect, it } from 'vitest';
import { getWordCount, getWordCountStatus } from './wordCountUtils';

describe('getWordCount', () => {
  it('counts characters excluding whitespace', () => {
    expect(getWordCount('가 나\n다')).toBe(3);
    expect(getWordCount('')).toBe(0);
  });
});

describe('getWordCountStatus', () => {
  it('maps counts to web-novel length tiers', () => {
    expect(getWordCountStatus(3999).label).toBe('부족');
    expect(getWordCountStatus(4000).label).toBe('충분');
    expect(getWordCountStatus(5000).label).toBe('베스트');
  });
});
