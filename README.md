# Novel Write Helper

소설 쓰기를 도와주는 웹 애플리케이션입니다.

## 주요 기능

### 📖 화별 스토리 관리
- 각 화별로 스토리를 작성하고 관리할 수 있습니다
- 제목과 본문을 입력하고 글자수를 실시간으로 확인할 수 있습니다
- 1분마다 자동으로 저장되어 작업 내용을 안전하게 보호합니다

### 📋 플롯 타임라인
- 좌측 패널에서 각 화별 플롯을 타임라인 형태로 관리할 수 있습니다
- 전체 스토리의 흐름을 한눈에 파악할 수 있습니다
- 각 플롯을 클릭하면 상세 내용을 확인하고 편집할 수 있습니다

### 👥 캐릭터 시트
- 우측 패널에서 등장인물들을 관리할 수 있습니다
- 캐릭터 이름, 역할, 상세 설명을 기록할 수 있습니다
- 역할별로 색상 구분되어 표시됩니다

### 💾 자동 저장
- 작성 중인 내용이 1분마다 자동으로 Firebase에 저장됩니다
- 실시간 글자수 카운팅으로 작성 분량을 확인할 수 있습니다

## 기술 스택

- **Frontend**: React, Material-UI
- **Backend**: Firebase Firestore
- **Styling**: Emotion CSS-in-JS

## 설치 및 실행

1. 프로젝트 클론
```bash
git clone <repository-url>
cd novel_write_helper
```

2. 패키지 설치
```bash
npm install
```

3. Firebase 설정
   - Firebase 콘솔(https://console.firebase.google.com)에서 새 프로젝트 생성
   - Firestore Database 활성화
   - 프로젝트 설정에서 웹 앱 추가
   - `src/firebase.js` 파일의 설정값을 본인의 Firebase 설정으로 교체

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

4. 개발 서버 실행
```bash
npm start
```

## Firebase Firestore 컬렉션 구조

### chapters (화별 스토리)
```javascript
{
  id: "auto-generated",
  title: "string",
  content: "string",
  order: "number",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### plots (플롯)
```javascript
{
  id: "auto-generated",
  title: "string",
  content: "string",
  order: "number",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### characters (캐릭터)
```javascript
{
  id: "auto-generated",
  name: "string",
  role: "string", // 주인공, 조연, 악역, 조력자, 기타
  description: "string",
  avatarColor: "string",
  order: "number",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

## 사용 방법

1. **새 화 작성**: 메인 화면에서 "새 화 추가" 버튼을 클릭
2. **플롯 관리**: 좌측 상단의 플롯 아이콘을 클릭하여 플롯 패널 열기
3. **캐릭터 관리**: 우측 상단의 캐릭터 아이콘을 클릭하여 캐릭터 패널 열기
4. **편집**: 각 카드나 목록 항목을 클릭하여 편집 모달 열기

## 개발자 참고사항

- 모든 데이터는 Firebase Firestore에 실시간으로 저장됩니다
- 자동 저장 기능으로 1분마다 작업 내용이 저장됩니다
- Material-UI 컴포넌트를 사용하여 반응형 디자인을 구현했습니다
- 글자수 카운팅은 공백을 제외한 실제 문자 수를 계산합니다

## 라이선스

MIT License
