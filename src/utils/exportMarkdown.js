import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import {
  allToMarkdown,
  chaptersToMarkdown,
  charactersToMarkdown,
  formatDate,
  plotsToMarkdown,
} from './markdownExport';

const loadOwned = async (collectionName, userId) => {
  const q = query(collection(db, collectionName), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const downloadText = (filename, text) => {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// kind: 'all' | 'plots' | 'characters' | 'chapters'
export const exportMarkdown = async (userId, kind = 'all') => {
  if (!userId) throw new Error('로그인이 필요합니다.');
  const stamp = formatDate(new Date());

  if (kind === 'plots') {
    downloadText(`플롯_${stamp}.md`, plotsToMarkdown(await loadOwned('plots', userId)));
  } else if (kind === 'characters') {
    downloadText(`캐릭터_${stamp}.md`, charactersToMarkdown(await loadOwned('characters', userId)));
  } else if (kind === 'chapters') {
    downloadText(`본문_${stamp}.md`, chaptersToMarkdown(await loadOwned('chapters', userId)));
  } else {
    const [plots, characters, chapters] = await Promise.all([
      loadOwned('plots', userId),
      loadOwned('characters', userId),
      loadOwned('chapters', userId),
    ]);
    downloadText(`소설_전체_${stamp}.md`, allToMarkdown({ plots, characters, chapters }));
  }
};
