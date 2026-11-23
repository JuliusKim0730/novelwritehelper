// 사용자가 저장한 플롯·캐릭터·본문(화)을 Markdown 문자열로 바꾸는 순수 함수들.
// Firestore 접근과 파일 다운로드는 exportMarkdown.js 에서 처리한다.

const byCreatedAt = (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);

const clean = (text) => (text || '').trim();

// 앱 화면(ChapterList)과 같은 규칙: 가장 먼저 만든 화가 프롤로그, 그다음부터 1화, 2화 ...
export const chapterLabel = (index) => (index === 0 ? '프롤로그' : `${index}화`);

export const formatDate = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const plotsToMarkdown = (plots, { headingLevel = 1 } = {}) => {
  const h = '#'.repeat(headingLevel);
  const lines = [`${h} 플롯`, ''];
  const sorted = [...plots].sort(byCreatedAt);
  if (sorted.length === 0) {
    lines.push('_저장된 플롯이 없습니다._', '');
    return lines.join('\n');
  }
  sorted.forEach((plot, i) => {
    const title = clean(plot.title) || `플롯 ${i + 1}`;
    lines.push(`${h}# ${title}`, '');
    if (clean(plot.episode)) lines.push(`- 회차: ${clean(plot.episode)}`, '');
    if (clean(plot.content)) lines.push(clean(plot.content), '');
  });
  return lines.join('\n');
};

const WRESTLER_FIELDS = [
  ['outfitFeatures', '복장 특징'],
  ['signatureMove', '필살기'],
  ['fanChant', '팬 응원 구호'],
  ['activeStage', '활동 무대'],
];

export const charactersToMarkdown = (characters, { headingLevel = 1 } = {}) => {
  const h = '#'.repeat(headingLevel);
  const lines = [`${h} 캐릭터`, ''];
  const sorted = [...characters].sort(
    (a, b) => (a.order || 0) - (b.order || 0) || byCreatedAt(a, b)
  );
  if (sorted.length === 0) {
    lines.push('_저장된 캐릭터가 없습니다._', '');
    return lines.join('\n');
  }
  sorted.forEach((character, i) => {
    const name = clean(character.name) || clean(character.title) || `캐릭터 ${i + 1}`;
    lines.push(`${h}# ${name}`, '');
    const meta = [];
    if (clean(character.role)) meta.push(`- 역할: ${clean(character.role)}`);
    WRESTLER_FIELDS.forEach(([key, label]) => {
      if (clean(character[key])) meta.push(`- ${label}: ${clean(character[key])}`);
    });
    if (meta.length) lines.push(...meta, '');
    if (clean(character.description)) lines.push(clean(character.description), '');
  });
  return lines.join('\n');
};

export const chaptersToMarkdown = (chapters, { headingLevel = 1 } = {}) => {
  const h = '#'.repeat(headingLevel);
  const lines = [`${h} 본문`, ''];
  const sorted = [...chapters].sort(byCreatedAt);
  if (sorted.length === 0) {
    lines.push('_저장된 화가 없습니다._', '');
    return lines.join('\n');
  }
  sorted.forEach((chapter, i) => {
    const label = chapterLabel(i);
    const title = clean(chapter.title);
    lines.push(`${h}# ${title ? `${label}. ${title}` : label}`, '');
    if (clean(chapter.subtitle)) lines.push(`_${clean(chapter.subtitle)}_`, '');
    if (clean(chapter.content)) lines.push(clean(chapter.content), '');
    if (i < sorted.length - 1) lines.push('---', '');
  });
  return lines.join('\n');
};

export const allToMarkdown = ({ plots, characters, chapters }, { title = '내 소설', date = new Date() } = {}) =>
  [
    `# ${title}`,
    '',
    `> 내보낸 날짜: ${formatDate(date)}`,
    '',
    plotsToMarkdown(plots, { headingLevel: 2 }),
    charactersToMarkdown(characters, { headingLevel: 2 }),
    chaptersToMarkdown(chapters, { headingLevel: 2 }),
  ].join('\n');
