import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  DragIndicator as DragIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const FloatingWindow = ({ data, type, onClose, initialPosition = { x: 100, y: 100 } }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const getRoleColor = (role) => {
    const roleColors = {
      '주연': 'primary',
      '조연': 'secondary',
      '레슬러': 'warning',
      '악역': 'error',
      '조력자': 'success',
      '기타': 'default'
    };
    return roleColors[role] || 'default';
  };

  if (!data) return null;

  return (
    <Paper
      ref={windowRef}
      onMouseDown={handleMouseDown}
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 420,
        maxHeight: 500,
        zIndex: 2000,
        boxShadow: 4,
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none'
      }}
    >
      {/* 헤더 */}
      <Box
        className="drag-handle"
        sx={{
          p: 1,
          backgroundColor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing'
          }
        }}
      >
        <DragIcon sx={{ mr: 1 }} />
        {type === 'plot' ? <TimelineIcon sx={{ mr: 1 }} /> : <PersonIcon sx={{ mr: 1 }} />}
        <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          {type === 'plot' ? '플롯' : '캐릭터'}: {type === 'plot' ? (data.title || '제목 없음') : (data.name || data.title || '이름 없음')}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 콘텐츠 */}
      <Box sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
        {type === 'plot' ? (
          <>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6">
                {data.title || '제목 없음'}
              </Typography>
              {data.episode && (
                <Chip
                  label={data.episode}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
            {data.updatedAt && (
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                수정일: {new Date(data.updatedAt.seconds * 1000).toLocaleDateString('ko-KR')}
              </Typography>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {data.content || '내용 없음'}
            </Typography>
          </>
        ) : (
          <>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{
                  bgcolor: data.avatarColor || 'primary.main',
                  width: 50,
                  height: 50,
                  mr: 2
                }}
              >
                {(data.name || data.title) ? (data.name || data.title).charAt(0) : '?'}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {data.name || data.title || '이름 없음'}
                </Typography>
                {data.role && (
                  <Chip
                    label={data.role}
                    size="small"
                    color={getRoleColor(data.role)}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {data.description || '설명 없음'}
            </Typography>
            
            {/* 레슬러 전용 정보 */}
            {data.role === '레슬러' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
                  레슬러 정보
                </Typography>
                
                {data.outfitFeatures && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.primary" gutterBottom>
                      복장의 특징
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {data.outfitFeatures}
                    </Typography>
                  </Box>
                )}
                
                {data.signatureMove && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.primary" gutterBottom>
                      시그니쳐 무브
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {data.signatureMove}
                    </Typography>
                  </Box>
                )}
                
                {data.fanChant && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.primary" gutterBottom>
                      팬들의 챈트
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {data.fanChant}
                    </Typography>
                  </Box>
                )}
                
                {data.activeStage && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.primary" gutterBottom>
                      활동 중인 무대
                    </Typography>
                    <Chip
                      label={data.activeStage}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default FloatingWindow; 