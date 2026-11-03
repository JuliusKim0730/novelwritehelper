import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const CharacterPanel = ({ onOpenEditor, onOpenFloating, userId }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);

  useEffect(() => {
    if (userId) {
      loadCharacters();
    }
  }, [userId]);

  const loadCharacters = async () => {
    try {
      // 사용자별 데이터 조회 또는 기존 데이터 (userId가 없는 것들)
      const charactersRef = collection(db, 'characters');
      let q;
      
      // meangyun0729@gmail.com의 UID와 비교하여 기존 데이터 처리
      const targetEmail = 'meangyun0729@gmail.com';
      
      if (userId) {
        // 현재 사용자의 데이터만 조회
        q = query(charactersRef, where('userId', '==', userId));
      } else {
        // userId가 없으면 전체 조회
        q = charactersRef;
      }
      
      const querySnapshot = await getDocs(q);
      const charactersData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        charactersData.push({ id: doc.id, ...data });
      });
      
      setCharacters(charactersData.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('캐릭터 목록 로드 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCharacter = () => {
    onOpenEditor({
      type: 'character',
      data: null,
      onSave: () => loadCharacters(),
      userId: userId
    });
  };

  const handleEditCharacter = (character) => {
    onOpenEditor({
      type: 'character',
      data: character,
      onSave: () => loadCharacters(),
      userId: userId
    });
  };

  const handleDeleteCharacter = (character) => {
    setCharacterToDelete(character);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!characterToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'characters', characterToDelete.id));
      loadCharacters();
      setDeleteDialogOpen(false);
      setCharacterToDelete(null);
    } catch (error) {
      console.error('캐릭터 삭제 중 오류:', error);
      alert('캐릭터 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCharacterToDelete(null);
  };

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

  if (!userId) {
    return (
      <Box sx={{ width: '100%', maxWidth: 400, p: 2 }}>
        <Typography>로그인이 필요합니다.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 400, p: 2 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <PersonIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          캐릭터 시트
        </Typography>
      </Box>

      <Button
        fullWidth
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleCreateCharacter}
        sx={{ mb: 2 }}
      >
        새 캐릭터 추가
      </Button>

      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Typography>로딩 중...</Typography>
      ) : characters.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            아직 등록된 캐릭터가 없습니다.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            소설의 인물들을 정리해보세요!
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {characters.map((character) => (
            <ListItem
              key={character.id}
              disablePadding
              sx={{
                mb: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Box sx={{ width: '100%', p: 1 }}>
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleEditCharacter(character)}
                >
                  <Avatar
                    sx={{
                      bgcolor: character.avatarColor || 'primary.main',
                      width: 40,
                      height: 40,
                      mr: 2
                    }}
                  >
                    {(character.name || character.title) ? (character.name || character.title).charAt(0) : '?'}
                  </Avatar>

                  <Box sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {character.name || character.title || '이름 없음'}
                      </Typography>
                      {character.role && (
                        <Chip
                          label={character.role}
                          size="small"
                          color={getRoleColor(character.role)}
                          variant="outlined"
                        />
                      )}
                    </Box>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {character.description || '설명 없음'}
                    </Typography>
                  </Box>
                </Box>

                {/* 버튼 영역 */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 1, 
                    mt: 2,
                    pt: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFloating(character);
                    }}
                    title="플로팅 윈도우로 열기"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCharacter(character);
                    }}
                    title="수정"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCharacter(character);
                    }}
                    color="error"
                    title="삭제"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      {characters.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
            총 {characters.length}명의 캐릭터
          </Typography>
        </>
      )}

      {/* 삭제 확인 팝업 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          캐릭터 삭제 확인
        </DialogTitle>
        <DialogContent>
          <Typography>
            <strong>"{characterToDelete?.name || characterToDelete?.title || '이름 없음'}"</strong> 캐릭터를 정말로 삭제하시겠습니까?
            <br />
            <br />
            삭제된 캐릭터는 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            취소
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharacterPanel; 