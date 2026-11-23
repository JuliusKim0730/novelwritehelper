import { describe, expect, it } from 'vitest';
import {
  allToMarkdown,
  chaptersToMarkdown,
  charactersToMarkdown,
  plotsToMarkdown,
} from './markdownExport';

const ts = (seconds) => ({ seconds });

describe('chaptersToMarkdown', () => {
  it('orders by creation time and labels the first as 프롤로그', () => {
    const md = chaptersToMarkdown([
      { title: '두 번째', content: '본문2', createdAt: ts(20) },
      { title: '시작', subtitle: '부제', content: '본문1', createdAt: ts(10) },
    ]);
    expect(md.indexOf('## 프롤로그. 시작')).toBeLessThan(md.indexOf('## 1화. 두 번째'));
    expect(md).toContain('_부제_');
    expect(md).toContain('본문1');
  });

  it('handles empty input', () => {
    expect(chaptersToMarkdown([])).toContain('저장된 화가 없습니다');
  });
});

describe('charactersToMarkdown', () => {
  it('includes role and wrestler fields', () => {
    const md = charactersToMarkdown([
      { name: '강철', role: '레슬러', signatureMove: '드롭킥', description: '설명' },
    ]);
    expect(md).toContain('## 강철');
    expect(md).toContain('- 역할: 레슬러');
    expect(md).toContain('- 필살기: 드롭킥');
    expect(md).toContain('설명');
  });
});

describe('plotsToMarkdown', () => {
  it('includes episode and content', () => {
    const md = plotsToMarkdown([{ title: '1부', episode: '1~3화', content: '전개' }]);
    expect(md).toContain('## 1부');
    expect(md).toContain('- 회차: 1~3화');
    expect(md).toContain('전개');
  });
});

describe('allToMarkdown', () => {
  it('nests sections under one title', () => {
    const md = allToMarkdown(
      { plots: [], characters: [], chapters: [] },
      { date: new Date(2026, 10, 23) }
    );
    expect(md).toMatch(/^# 내 소설/);
    expect(md).toContain('내보낸 날짜: 2026-11-23');
    expect(md).toContain('\n## 플롯');
    expect(md).toContain('\n## 캐릭터');
    expect(md).toContain('\n## 본문');
  });
});
