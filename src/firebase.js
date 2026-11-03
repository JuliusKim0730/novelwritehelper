import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyCuXeDN99W4dyaspZVTYn8N03Yz2gY8nSA",
  authDomain: "novelhelper-52b0f.firebaseapp.com",
  projectId: "novelhelper-52b0f",
  storageBucket: "novelhelper-52b0f.firebasestorage.app",
  messagingSenderId: "27085066647",
  appId: "1:27085066647:web:9f3a1f2c4e5b6d8e9a0b1c"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 초기화
export const db = getFirestore(app);

// Authentication 초기화
export const auth = getAuth(app);

// Google 로그인 프로바이더 설정
export const googleProvider = new GoogleAuthProvider();

export default app; 