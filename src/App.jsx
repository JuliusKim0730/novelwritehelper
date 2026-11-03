import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, IconButton, Drawer } from '@mui/material';
import { Edit as EditIcon, People as PeopleIcon, PushPin as PinIcon, Close as CloseIcon } from '@mui/icons-material';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import ChapterList from './components/ChapterList';
import PlotPanel from './components/PlotPanel';
import CharacterPanel from './components/CharacterPanel';
import EditorModal from './components/EditorModal';
import FloatingWindow from './components/FloatingWindow';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0', // 보라색
    },
    background: {
      default: '#fafafa',
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [leftDrawerPinned, setLeftDrawerPinned] = useState(false);
  const [rightDrawerPinned, setRightDrawerPinned] = useState(false);
  const [leftDrawerWidth] = useState(450);
  const [rightDrawerWidth] = useState(450);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorData, setEditorData] = useState(null);
  
  // 플로팅 윈도우 상태
  const [floatingPlot, setFloatingPlot] = useState(null);
  const [floatingCharacter, setFloatingCharacter] = useState(null);

  // 인증 상태 모니터링
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      console.log('인증 상태 변경:', currentUser?.email);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user) => {
    setUser(user);
  };

  const handleOpenEditor = (data) => {
    setEditorData({ ...data, userId: user?.uid });
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditorData(null);
  };

  const handleOpenFloatingPlot = (plotData) => {
    setFloatingPlot(plotData);
  };

  const handleCloseFloatingPlot = () => {
    setFloatingPlot(null);
  };

  const handleOpenFloatingCharacter = (characterData) => {
    setFloatingCharacter(characterData);
  };

  const handleCloseFloatingCharacter = () => {
    setFloatingCharacter(null);
  };

  const handleLeftDrawerToggle = () => {
    if (leftDrawerPinned) {
      setLeftDrawerPinned(false);
      setLeftDrawerOpen(false);
    } else {
      setLeftDrawerOpen(!leftDrawerOpen);
    }
  };

  const handleRightDrawerToggle = () => {
    if (rightDrawerPinned) {
      setRightDrawerPinned(false);
      setRightDrawerOpen(false);
    } else {
      setRightDrawerOpen(!rightDrawerOpen);
    }
  };

  const handleLeftDrawerPin = () => {
    setLeftDrawerPinned(!leftDrawerPinned);
    if (!leftDrawerPinned) {
      setLeftDrawerOpen(true);
    }
  };

  const handleRightDrawerPin = () => {
    setRightDrawerPinned(!rightDrawerPinned);
    if (!rightDrawerPinned) {
      setRightDrawerOpen(true);
    }
  };

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography>로딩 중...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // 로그인하지 않은 경우 로그인 페이지 표시
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        {/* 좌측 플롯 패널 */}
        <Drawer
          variant={leftDrawerPinned ? "persistent" : "temporary"}
          anchor="left"
          open={leftDrawerOpen}
          onClose={() => !leftDrawerPinned && setLeftDrawerOpen(false)}
          sx={{
            width: leftDrawerPinned ? leftDrawerWidth : 'auto',
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: leftDrawerWidth,
              boxSizing: 'border-box',
              top: leftDrawerPinned ? 64 : 0,
              height: leftDrawerPinned ? 'calc(100vh - 64px)' : '100vh',
              zIndex: leftDrawerPinned ? 1000 : 1300,
            },
          }}
        >
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>플롯</Typography>
            <Box>
              <IconButton 
                size="small" 
                onClick={handleLeftDrawerPin}
                color={leftDrawerPinned ? "primary" : "default"}
              >
                <PinIcon />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => setLeftDrawerOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <PlotPanel 
            onOpenEditor={handleOpenEditor} 
            onOpenFloating={handleOpenFloatingPlot}
            userId={user?.uid}
          />
        </Drawer>

        {/* 메인 콘텐츠 영역 */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          marginLeft: leftDrawerPinned ? `${leftDrawerWidth}px` : 0,
          marginRight: rightDrawerPinned ? `${rightDrawerWidth}px` : 0,
          transition: 'margin 0.3s ease',
        }}>
          <AppBar position="static" sx={{ zIndex: 1400 }}>
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="plot menu"
                sx={{ mr: 2 }}
                onClick={handleLeftDrawerToggle}
              >
                <EditIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                Novel Write Helper
              </Typography>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="character menu"
                onClick={handleRightDrawerToggle}
              >
                <PeopleIcon />
              </IconButton>
              <UserProfile user={user} />
            </Toolbar>
          </AppBar>

          {/* 메인 콘텐츠 - 화별 목록 */}
          <Box sx={{ p: 3, flexGrow: 1 }}>
            <ChapterList onOpenEditor={handleOpenEditor} userId={user?.uid} />
          </Box>
        </Box>

        {/* 우측 캐릭터 패널 */}
        <Drawer
          variant={rightDrawerPinned ? "persistent" : "temporary"}
          anchor="right"
          open={rightDrawerOpen}
          onClose={() => !rightDrawerPinned && setRightDrawerOpen(false)}
          sx={{
            width: rightDrawerPinned ? rightDrawerWidth : 'auto',
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: rightDrawerWidth,
              boxSizing: 'border-box',
              top: rightDrawerPinned ? 64 : 0,
              height: rightDrawerPinned ? 'calc(100vh - 64px)' : '100vh',
              zIndex: rightDrawerPinned ? 1000 : 1300,
            },
          }}
        >
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>캐릭터</Typography>
            <Box>
              <IconButton 
                size="small" 
                onClick={handleRightDrawerPin}
                color={rightDrawerPinned ? "primary" : "default"}
              >
                <PinIcon />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => setRightDrawerOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <CharacterPanel 
            onOpenEditor={handleOpenEditor} 
            onOpenFloating={handleOpenFloatingCharacter}
            userId={user?.uid}
          />
        </Drawer>

        {/* 에디터 모달 */}
        <EditorModal
          open={editorOpen}
          onClose={handleCloseEditor}
          data={editorData}
        />

        {/* 플로팅 윈도우들 */}
        {floatingPlot && (
          <FloatingWindow
            data={floatingPlot}
            type="plot"
            onClose={handleCloseFloatingPlot}
            initialPosition={{ x: 50, y: 150 }}
          />
        )}

        {floatingCharacter && (
          <FloatingWindow
            data={floatingCharacter}
            type="character"
            onClose={handleCloseFloatingCharacter}
            initialPosition={{ x: 420, y: 150 }}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;