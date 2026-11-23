import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { exportMarkdown } from '../utils/exportMarkdown';

// kind: 'all' | 'plots' | 'characters' | 'chapters'
const ExportButton = ({ userId, kind, children, ...buttonProps }) => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setExporting(true);
    try {
      await exportMarkdown(userId, kind);
    } catch (e) {
      console.error('내보내기 실패:', e);
      setError('다운로드 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleClick}
        disabled={exporting || !userId}
        {...buttonProps}
      >
        {exporting ? '준비 중...' : children}
      </Button>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportButton;
