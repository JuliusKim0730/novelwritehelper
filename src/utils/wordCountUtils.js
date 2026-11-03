export const getWordCount = (text) => {
  if (!text) return 0;
  return text.replace(/\s+/g, '').length;
};

export const getWordCountStatus = (count) => {
  if (count < 4000) {
    return {
      label: '부족',
      color: 'error', // 빨간색
      severity: 'error'
    };
  } else if (count < 5000) {
    return {
      label: '충분',
      color: 'success', // 초록색
      severity: 'success'
    };
  } else {
    return {
      label: '베스트',
      color: 'secondary', // 보라색 (Material-UI의 secondary는 보라색)
      severity: 'info'
    };
  }
}; 