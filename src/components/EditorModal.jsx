import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, AutoAwesome as AutoIcon } from '@mui/icons-material';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getWordCount, getWordCountStatus } from '../utils/wordCountUtils';

const EditorModal = ({ open, onClose, data }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [episode, setEpisode] = useState('');
  const [outfitFeatures, setOutfitFeatures] = useState('');
  const [signatureMove, setSignatureMove] = useState('');
  const [fanChant, setFanChant] = useState('');
  const [activeStage, setActiveStage] = useState('');
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedRef = useRef({ title: '', subtitle: '', content: '', role: '', description: '', name: '', episode: '', outfitFeatures: '', signatureMove: '', fanChant: '', activeStage: '' });
  const originalDataRef = useRef({ title: '', subtitle: '', content: '', role: '', description: '', name: '', episode: '', outfitFeatures: '', signatureMove: '', fanChant: '', activeStage: '' });

  useEffect(() => {
    if (data?.data) {
      const originalData = {
        title: data.data.title || '',
        subtitle: data.data.subtitle || '',
        content: data.data.content || '',
        role: data.data.role || '',
        description: data.data.description || '',
        name: data.data.name || '',
        episode: data.data.episode || '',
        outfitFeatures: data.data.outfitFeatures || '',
        signatureMove: data.data.signatureMove || '',
        fanChant: data.data.fanChant || '',
        activeStage: data.data.activeStage || ''
      };
      
      setTitle(originalData.title);
      setSubtitle(originalData.subtitle);
      setContent(originalData.content);
      setRole(originalData.role);
      setDescription(originalData.description);
      setName(originalData.name);
      setEpisode(originalData.episode);
      setOutfitFeatures(originalData.outfitFeatures);
      setSignatureMove(originalData.signatureMove);
      setFanChant(originalData.fanChant);
      setActiveStage(originalData.activeStage);
      
      lastSavedRef.current = { ...originalData };
      originalDataRef.current = { ...originalData };
    } else {
      const emptyData = { title: '', subtitle: '', content: '', role: '', description: '', name: '', episode: '', outfitFeatures: '', signatureMove: '', fanChant: '', activeStage: '' };
      setTitle('');
      setSubtitle('');
      setContent('');
      setRole('');
      setDescription('');
      setName('');
      setEpisode('');
      setOutfitFeatures('');
      setSignatureMove('');
      setFanChant('');
      setActiveStage('');
      lastSavedRef.current = { ...emptyData };
      originalDataRef.current = { ...emptyData };
    }
  }, [data]);

  // 자동 저장 로직
  useEffect(() => {
    if (!open || !data) return;

    const currentData = { title, subtitle, content, role, description, name, episode, outfitFeatures, signatureMove, fanChant, activeStage };
    const hasChanges = Object.keys(currentData).some(
      key => currentData[key] !== lastSavedRef.current[key]
    );

    if (hasChanges) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(async () => {
        await handleAutoSave();
      }, 60000); // 1분마다 자동 저장
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, subtitle, content, role, description, name, episode, outfitFeatures, signatureMove, fanChant, activeStage, open, data]);

  const handleAutoSave = async () => {
    if (!data || (!title.trim() && !subtitle.trim() && !content.trim() && !role.trim() && !description.trim() && !name.trim() && !episode.trim() && !outfitFeatures.trim() && !signatureMove.trim() && !fanChant.trim() && !activeStage.trim())) return;

    try {
      await saveData(false);
      setAutoSaved(true);
      setAlertMessage('자동 저장되었습니다');
      setShowAlert(true);
      setTimeout(() => setAutoSaved(false), 2000);
    } catch (error) {
      console.error('자동 저장 실패:', error);
    }
  };

  const saveData = async (showMessage = true) => {
    const saveData = {
      title: title.trim(),
      updatedAt: serverTimestamp(),
      userId: data.userId || data.data?.userId
    };

    if (data.type === 'chapter') {
      saveData.content = content.trim();
      saveData.subtitle = subtitle.trim();
      saveData.order = data.data?.order || 0;
    } else if (data.type === 'plot') {
      saveData.content = content.trim();
      saveData.episode = episode.trim();
      saveData.order = data.data?.order || 0;
    } else if (data.type === 'character') {
      saveData.name = name.trim();
      saveData.role = role.trim();
      saveData.description = description.trim();
      saveData.order = data.data?.order || 0;
      saveData.avatarColor = data.data?.avatarColor || '#1976d2';
      
      if (role === '레슬러') {
        saveData.outfitFeatures = outfitFeatures.trim();
        saveData.signatureMove = signatureMove.trim();
        saveData.fanChant = fanChant.trim();
        saveData.activeStage = activeStage.trim();
      }
    }

    const collectionName = data.type === 'chapter' ? 'chapters' : 
                          data.type === 'plot' ? 'plots' : 'characters';

    if (data.data?.id) {
      await setDoc(doc(db, collectionName, data.data.id), saveData, { merge: true });
    } else {
      await addDoc(collection(db, collectionName), {
        ...saveData,
        createdAt: serverTimestamp()
      });
    }

    lastSavedRef.current = { title, subtitle, content, role, description, name, episode, outfitFeatures, signatureMove, fanChant, activeStage };
    
    if (showMessage) {
      setAlertMessage('저장되었습니다');
      setShowAlert(true);
    }
  };

  const handleSave = async () => {
    if (!title.trim() && !subtitle.trim() && !content.trim() && !role.trim() && !description.trim() && !name.trim() && !episode.trim() && !outfitFeatures.trim() && !signatureMove.trim() && !fanChant.trim() && !activeStage.trim()) {
      setAlertMessage('내용을 입력해주세요');
      setShowAlert(true);
      return;
    }

    setSaving(true);
    try {
      await saveData();
      if (data.onSave) data.onSave();
      onClose();
    } catch (error) {
      console.error('저장 실패:', error);
      setAlertMessage('저장 중 오류가 발생했습니다');
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = () => {
    const currentData = { title, subtitle, content, role, description, name, episode, outfitFeatures, signatureMove, fanChant, activeStage };
    return Object.keys(currentData).some(
      key => currentData[key] !== originalDataRef.current[key]
    );
  };

  const handleClose = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    if (hasUnsavedChanges()) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  const handleCancelConfirm = () => {
    // 원래 데이터로 복원
    setTitle(originalDataRef.current.title);
    setSubtitle(originalDataRef.current.subtitle);
    setContent(originalDataRef.current.content);
    setRole(originalDataRef.current.role);
    setDescription(originalDataRef.current.description);
    setName(originalDataRef.current.name);
    setEpisode(originalDataRef.current.episode);
    setOutfitFeatures(originalDataRef.current.outfitFeatures);
    setSignatureMove(originalDataRef.current.signatureMove);
    setFanChant(originalDataRef.current.fanChant);
    setActiveStage(originalDataRef.current.activeStage);
    
    setShowCancelConfirm(false);
    onClose();
  };

  const handleCancelDeny = () => {
    setShowCancelConfirm(false);
  };

  const getModalTitle = () => {
    const type = data?.type;
    const isEdit = data?.data?.id;
    
    if (type === 'chapter') return isEdit ? '화 편집' : '새 화 작성';
    if (type === 'plot') return isEdit ? '플롯 편집' : '새 플롯 작성';
    if (type === 'character') return isEdit ? '캐릭터 편집' : '새 캐릭터 등록';
    return '편집';
  };

  const roleOptions = ['주연', '조연', '레슬러', '악역', '조력자', '기타'];
  const stageOptions = ['기타 단체', 'Glory', 'Strike', 'Rise'];

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '600px' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{getModalTitle()}</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {autoSaved && (
                <Chip
                  icon={<AutoIcon />}
                  label="자동 저장됨"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {data?.type === 'chapter' ? (
            <>
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="화 제목"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  variant="outlined"
                  autoFocus
                  placeholder="이 화의 제목을 입력해주세요... (예: 운명적인 만남)"
                />
              </Box>
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="본문"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  variant="outlined"
                  multiline
                  rows={15}
                  placeholder="소설 내용을 작성해주세요..."
                />
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Box display="flex" gap={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      글자수: {getWordCount(content)}자
                    </Typography>
                    <Chip
                      label={getWordCountStatus(getWordCount(content)).label}
                      size="small"
                      color={getWordCountStatus(getWordCount(content)).color}
                      variant="filled"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    자동 저장: 1분마다
                  </Typography>
                </Box>
              </Box>
            </>
          ) : data?.type === 'character' ? (
            <>
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="제목"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="outlined"
                  autoFocus
                />
              </Box>
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="outlined"
                  placeholder="캐릭터의 이름을 입력해주세요..."
                />
              </Box>
              <Box mb={3}>
                <FormControl fullWidth>
                  <InputLabel>역할</InputLabel>
                  <Select
                    value={role}
                    label="역할"
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {roleOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="캐릭터 설명"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                  multiline
                  rows={10}
                  placeholder="캐릭터의 외모, 성격, 배경 등을 자세히 설명해주세요..."
                />
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Box display="flex" gap={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      글자수: {getWordCount(description)}자
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* 레슬러 전용 필드들 */}
              {role === '레슬러' && (
                <>
                  <Box mb={3}>
                    <TextField
                      fullWidth
                      label="복장의 특징"
                      value={outfitFeatures}
                      onChange={(e) => setOutfitFeatures(e.target.value)}
                      variant="outlined"
                      multiline
                      rows={3}
                      placeholder="레슬러의 복장과 외관적 특징을 설명해주세요..."
                    />
                  </Box>
                  
                  <Box mb={3}>
                    <TextField
                      fullWidth
                      label="시그니쳐 무브"
                      value={signatureMove}
                      onChange={(e) => setSignatureMove(e.target.value)}
                      variant="outlined"
                      placeholder="대표적인 필살기나 기술을 입력해주세요..."
                    />
                  </Box>
                  
                  <Box mb={3}>
                    <TextField
                      fullWidth
                      label="팬들의 챈트"
                      value={fanChant}
                      onChange={(e) => setFanChant(e.target.value)}
                      variant="outlined"
                      placeholder="팬들이 부르는 응원 구호를 입력해주세요..."
                    />
                  </Box>
                  
                  <Box mb={3}>
                    <FormControl fullWidth>
                      <InputLabel>활동 중인 무대</InputLabel>
                      <Select
                        value={activeStage}
                        label="활동 중인 무대"
                        onChange={(e) => setActiveStage(e.target.value)}
                      >
                        {stageOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </>
              )}
            </>
          ) : data?.type === 'plot' ? (
            <>
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="제목"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="outlined"
                  autoFocus
                />
              </Box>
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="화수"
                  value={episode}
                  onChange={(e) => setEpisode(e.target.value)}
                  variant="outlined"
                  placeholder="몇화의 플롯인지 입력해주세요... (예: 1화, 2화)"
                />
              </Box>
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="플롯 내용"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  variant="outlined"
                  multiline
                  rows={15}
                  placeholder="이 화의 주요 사건과 흐름을 정리해주세요..."
                />
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Box display="flex" gap={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      글자수: {getWordCount(content)}자
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    자동 저장: 1분마다
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <Box mb={3}>
              <TextField
                fullWidth
                label="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
                autoFocus
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={<SaveIcon />}
          >
            {saving ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 취소 확인 팝업 */}
      <Dialog
        open={showCancelConfirm}
        onClose={handleCancelDeny}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          수정 내용이 있습니다
        </DialogTitle>
        <DialogContent>
          <Typography>
            수정된 내용이 저장되지 않았습니다. 정말로 취소하시겠습니까?
            <br />
            취소하면 모든 변경사항이 사라집니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeny}>
            계속 편집
          </Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            취소하고 나가기
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowAlert(false)} 
          severity="success"
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditorModal; 