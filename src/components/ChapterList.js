import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getWordCount, getWordCountStatus } from '../utils/wordCountUtils';

const ChapterList = ({ onOpenEditor, userId }) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' 또는 'desc'

  useEffect(() => {
    if (userId) {
      loadChapters();
    }
  }, [userId]);

  const loadChapters = async () => {
    try {
      const chaptersRef = collection(db, 'chapters');
      let q;
      
      if (userId) {
        // 현재 사용자의 데이터만 조회
        q = query(chaptersRef, where('userId', '==', userId));
      } else {
        // userId가 없으면 전체 조회
        q = chaptersRef;
      }
      
      const querySnapshot = await getDocs(q);
      const chaptersData = [];
      querySnapshot.forEach((doc) => {
        chaptersData.push({ id: doc.id, ...doc.data() });
      });
      setChapters(chaptersData.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('화 목록 로드 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedChapters = () => {
    const sorted = [...chapters].sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      
      if (sortOrder === 'desc') {
        return bTime - aTime; // 최신순 (내림차순)
      } else {
        return aTime - bTime; // 오래된순 (오름차순)
      }
    });
    return sorted;
  };

  const getChapterNumber = (index) => {
    const sortedChapters = getSortedChapters();
    const totalChapters = sortedChapters.length;
    
    if (sortOrder === 'desc') {
      // 최신순일 때: 가장 최근 = 마지막 화, 가장 오래된 = 프롤로그
      if (index === totalChapters - 1) {
        return '프롤로그';
      } else {
        return `${totalChapters - index - 1}화`;
      }
    } else {
      // 오래된순일 때: 가장 오래된 = 프롤로그, 가장 최근 = 마지막 화
      if (index === 0) {
        return '프롤로그';
      } else {
        return `${index}화`;
      }
    }
  };

  const handleSortOrderChange = (event, newOrder) => {
    if (newOrder !== null) {
      setSortOrder(newOrder);
    }
  };

  const handleCreateChapter = () => {
    onOpenEditor({
      type: 'chapter',
      data: null,
      onSave: () => loadChapters(),
      userId: userId
    });
  };

  const handleEditChapter = (chapter) => {
    onOpenEditor({
      type: 'chapter',
      data: chapter,
      onSave: () => loadChapters(),
      userId: userId
    });
  };

  const handleDeleteChapter = (chapter) => {
    setChapterToDelete(chapter);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chapterToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'chapters', chapterToDelete.id));
      loadChapters();
      setDeleteDialogOpen(false);
      setChapterToDelete(null);
    } catch (error) {
      console.error('화 삭제 중 오류:', error);
      alert('화 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setChapterToDelete(null);
  };

  const getWordCount = (content) => {
    if (!content) return 0;
    return content.replace(/\s+/g, '').length;
  };

  if (!userId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>로그인이 필요합니다.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  const sortedChapters = getSortedChapters();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          화별 목록
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          {/* 정렬 토글 버튼 */}
          <ToggleButtonGroup
            value={sortOrder}
            exclusive
            onChange={handleSortOrderChange}
            size="small"
          >
            <ToggleButton value="desc">
              <Tooltip title="최신순 (최근 작성이 위로)">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ArrowDownIcon fontSize="small" />
                  <Typography variant="caption">최신순</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="asc">
              <Tooltip title="오래된순 (프롤로그가 위로)">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ArrowUpIcon fontSize="small" />
                  <Typography variant="caption">시간순</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateChapter}
          >
            새 화 추가
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {sortedChapters.map((chapter, index) => (
          <Grid item xs={12} sm={6} md={4} key={chapter.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 3,
                  cursor: 'pointer'
                }
              }}
              onClick={() => handleEditChapter(chapter)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Chip
                      label={getChapterNumber(index)}
                      size="small"
                      color="primary"
                      variant="filled"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6" component="h2" gutterBottom>
                      {chapter.subtitle || chapter.title || '제목 없음'}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={0.5}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditChapter(chapter);
                      }}
                      title="편집"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(chapter);
                      }}
                      title="삭제"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    mb: 2,
                    minHeight: 60
                  }}
                >
                  {chapter.content || '내용 없음'}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" gap={1}>
                    <Chip
                      label={`${getWordCount(chapter.content)}자`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={getWordCountStatus(getWordCount(chapter.content)).label}
                      size="small"
                      color={getWordCountStatus(getWordCount(chapter.content)).color}
                      variant="filled"
                    />
                  </Box>
                  {chapter.createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(chapter.createdAt.seconds * 1000).toLocaleDateString('ko-KR')}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {chapters.length === 0 && (
          <Grid item xs={12}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight="200px"
              textAlign="center"
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                아직 작성된 화가 없습니다.
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                첫 번째 화를 작성해보세요!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateChapter}
              >
                새 화 추가
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* 삭제 확인 팝업 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          화 삭제 확인
        </DialogTitle>
        <DialogContent>
          <Typography>
            <strong>"{chapterToDelete?.subtitle || chapterToDelete?.title || '제목 없음'}"</strong> 화를 정말로 삭제하시겠습니까?
            <br />
            <br />
            삭제된 화는 복구할 수 없습니다.
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

export default ChapterList; 