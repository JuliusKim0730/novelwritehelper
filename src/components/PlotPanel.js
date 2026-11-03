import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
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
  Timeline as TimelineIcon,
  OpenInNew as OpenInNewIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const PlotPanel = ({ onOpenEditor, onOpenFloating, userId }) => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [plotToDelete, setPlotToDelete] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' 또는 'desc'

  useEffect(() => {
    if (userId) {
      loadPlots();
    }
  }, [userId]);

  const loadPlots = async () => {
    try {
      const plotsRef = collection(db, 'plots');
      let q;
      
      if (userId) {
        // 현재 사용자의 데이터만 조회
        q = query(plotsRef, where('userId', '==', userId));
      } else {
        // userId가 없으면 전체 조회
        q = plotsRef;
      }
      
      const querySnapshot = await getDocs(q);
      const plotsData = [];
      querySnapshot.forEach((doc) => {
        plotsData.push({ id: doc.id, ...doc.data() });
      });
      setPlots(plotsData);
    } catch (error) {
      console.error('플롯 목록 로드 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedPlots = () => {
    const sorted = [...plots].sort((a, b) => {
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

  const getPlotNumber = (index) => {
    const sortedPlots = getSortedPlots();
    const totalPlots = sortedPlots.length;
    
    if (sortOrder === 'desc') {
      // 최신순일 때: 가장 최근 = 마지막 화, 가장 오래된 = 프롤로그
      if (index === totalPlots - 1) {
        return '프롤로그';
      } else {
        return `${totalPlots - index - 1}화`;
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

  const handleCreatePlot = () => {
    onOpenEditor({
      type: 'plot',
      data: null,
      onSave: () => loadPlots(),
      userId: userId
    });
  };

  const handleEditPlot = (plot) => {
    onOpenEditor({
      type: 'plot',
      data: plot,
      onSave: () => loadPlots(),
      userId: userId
    });
  };

  const handleDeletePlot = (plot) => {
    setPlotToDelete(plot);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!plotToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'plots', plotToDelete.id));
      loadPlots();
      setDeleteDialogOpen(false);
      setPlotToDelete(null);
    } catch (error) {
      console.error('플롯 삭제 중 오류:', error);
      alert('플롯 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPlotToDelete(null);
  };

  if (!userId) {
    return (
      <Box sx={{ width: '100%', maxWidth: 400, p: 2 }}>
        <Typography>로그인이 필요합니다.</Typography>
      </Box>
    );
  }

  const sortedPlots = getSortedPlots();

  return (
    <Box sx={{ width: '100%', maxWidth: 400, p: 2 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <TimelineIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          플롯 타임라인
        </Typography>
      </Box>

      <Button
        fullWidth
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleCreatePlot}
        sx={{ mb: 2 }}
      >
        새 플롯 추가
      </Button>

      {/* 정렬 토글 버튼 */}
      <Box display="flex" justifyContent="center" mb={2}>
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
      </Box>

      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Typography>로딩 중...</Typography>
      ) : plots.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            아직 작성된 플롯이 없습니다.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            스토리의 전체적인 흐름을 정리해보세요!
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {sortedPlots.map((plot, index) => (
            <React.Fragment key={plot.id}>
              <ListItem
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
                      cursor: 'pointer'
                    }}
                    onClick={() => handleEditPlot(plot)}
                  >
                    <Box display="flex" alignItems="center" mb={1}>
                      <Chip
                        label={plot.episode || getPlotNumber(index)}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      {plot.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(plot.createdAt.seconds * 1000).toLocaleDateString('ko-KR')}
                        </Typography>
                      )}
                    </Box>
                    
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom
                      sx={{ fontWeight: 'bold' }}
                    >
                      {plot.title || '제목 없음'}
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {plot.content || '내용 없음'}
                    </Typography>
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
                        onOpenFloating(plot);
                      }}
                      title="플로팅 윈도우로 열기"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPlot(plot);
                      }}
                      title="수정"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlot(plot);
                      }}
                      color="error"
                      title="삭제"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
              
              {/* 타임라인 연결선 */}
              {index < sortedPlots.length - 1 && (
                <Box display="flex" justifyContent="center" my={1}>
                  <Box
                    sx={{
                      width: 2,
                      height: 20,
                      bgcolor: 'primary.main',
                      opacity: 0.3
                    }}
                  />
                </Box>
              )}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* 삭제 확인 팝업 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          플롯 삭제 확인
        </DialogTitle>
        <DialogContent>
          <Typography>
            <strong>"{plotToDelete?.title || '제목 없음'}"</strong> 플롯을 정말로 삭제하시겠습니까?
            <br />
            <br />
            삭제된 플롯은 복구할 수 없습니다.
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

export default PlotPanel; 