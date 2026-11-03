import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const LoginPage = ({ onLoginSuccess }) => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('로그인 성공:', user);
      onLoginSuccess(user);
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('로그인 중 오류가 발생했습니다: ' + error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Novel Write Helper
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            소설 작성 도우미
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Google 계정으로 로그인하여 나만의 소설을 작성하고 관리하세요.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: 2
            }}
          >
            Google로 로그인
          </Button>
          
          <Typography variant="caption" display="block" sx={{ mt: 3, color: 'text.secondary' }}>
            로그인하면 개인 데이터가 안전하게 보호됩니다.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 