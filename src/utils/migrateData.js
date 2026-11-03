import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const migrateExistingData = async (userId) => {
  try {
    console.log('데이터 마이그레이션 시작...', userId);
    
    // 1. 캐릭터 데이터 마이그레이션
    const charactersRef = collection(db, 'characters');
    const charactersQuery = query(charactersRef, where('userId', '==', undefined));
    
    try {
      const charactersSnapshot = await getDocs(charactersRef);
      const charactersToUpdate = [];
      
      charactersSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (!data.userId) {
          charactersToUpdate.push({ id: docSnapshot.id, data });
        }
      });
      
      console.log(`마이그레이션할 캐릭터: ${charactersToUpdate.length}개`);
      
      for (const character of charactersToUpdate) {
        await updateDoc(doc(db, 'characters', character.id), {
          userId: userId
        });
      }
    } catch (error) {
      console.error('캐릭터 마이그레이션 오류:', error);
    }
    
    // 2. 화(챕터) 데이터 마이그레이션
    const chaptersRef = collection(db, 'chapters');
    
    try {
      const chaptersSnapshot = await getDocs(chaptersRef);
      const chaptersToUpdate = [];
      
      chaptersSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (!data.userId) {
          chaptersToUpdate.push({ id: docSnapshot.id, data });
        }
      });
      
      console.log(`마이그레이션할 화: ${chaptersToUpdate.length}개`);
      
      for (const chapter of chaptersToUpdate) {
        await updateDoc(doc(db, 'chapters', chapter.id), {
          userId: userId
        });
      }
    } catch (error) {
      console.error('화 마이그레이션 오류:', error);
    }
    
    // 3. 플롯 데이터 마이그레이션
    const plotsRef = collection(db, 'plots');
    
    try {
      const plotsSnapshot = await getDocs(plotsRef);
      const plotsToUpdate = [];
      
      plotsSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (!data.userId) {
          plotsToUpdate.push({ id: docSnapshot.id, data });
        }
      });
      
      console.log(`마이그레이션할 플롯: ${plotsToUpdate.length}개`);
      
      for (const plot of plotsToUpdate) {
        await updateDoc(doc(db, 'plots', plot.id), {
          userId: userId
        });
      }
    } catch (error) {
      console.error('플롯 마이그레이션 오류:', error);
    }
    
    console.log('데이터 마이그레이션 완료!');
    return true;
  } catch (error) {
    console.error('마이그레이션 전체 오류:', error);
    return false;
  }
}; 