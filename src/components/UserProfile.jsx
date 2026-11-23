import React, { useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import { Logout as LogoutIcon, Person as PersonIcon, Download as DownloadIcon } from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { exportMarkdown } from '../utils/exportMarkdown';

const EXPORT_OPTIONS = [
  { kind: 'all', label: '플롯+캐릭터+작성본 한 파일로 (.md)' },
  { kind: 'plots', label: '플롯만 (.md)' },
  { kind: 'characters', label: '캐릭터만 (.md)' },
  { kind: 'chapters', label: '본문만 (.md)' },
];

const UserProfile = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const handleExport = async (kind) => {
    handleClose();
    setExporting(true);
    try {
      await exportMarkdown(user?.uid, kind);
    } catch (error) {
      console.error('내보내기 실패:', error);
      setExportError('내보내기 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 에러:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          src={user?.photoURL}
          sx={{ width: 32, height: 32 }}
        >
          {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
        </Avatar>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {user?.displayName || '사용자'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>프로필</ListItemText>
        </MenuItem>
        
        <Divider />

        <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block' }}>
          Markdown으로 내보내기
        </Typography>
        {EXPORT_OPTIONS.map(({ kind, label }) => (
          <MenuItem key={kind} onClick={() => handleExport(kind)} disabled={exporting}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>로그아웃</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={Boolean(exportError)}
        autoHideDuration={4000}
        onClose={() => setExportError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setExportError('')}>
          {exportError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserProfile; 