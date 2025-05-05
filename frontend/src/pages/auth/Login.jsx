import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Link, 
  InputAdornment, 
  IconButton, 
  Paper, 
  Container,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/logo.png';
//import './Login.css';

// Validation schema for login form
const loginSchema = yup.object().shape({
  username: yup.string().required('Email or username is required'),
  password: yup.string().required('Password is required')
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Only redirect if authenticated and not loading
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/');
    }
  }, [navigate, loading, isAuthenticated]);

  // Form configuration using react-hook-form with yup validation
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema)
  });

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoginError(null);
      await login(data.username, data.password);
      // No need to navigate here as the useEffect will handle it
    } catch (error) {
      setLoginError(error.message || 'Login failed');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      {/* Left side with logo and background */}
      <Box 
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'linear-gradient(135deg, #004080 0%, #0078bf 100%)',
          p: 4,
          color: 'white'
        }}
      >
        <Box 
          className="login-animation"
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '100%',
            maxWidth: 400,
            p: 2
          }}
        >
          <img 
            src={logo} 
            alt="MedTrans Express Inc." 
            style={{ 
              maxWidth: '80%', 
              height: 'auto', 
              marginBottom: '1rem' 
            }} 
          />
          <Typography variant="subtitle1" color="white" sx={{ mt: 2, fontStyle: 'italic' }}>
            Your partner in the wellness process
          </Typography>
        </Box>
      </Box>

      {/* Right side with login form */}
      <Box 
        component={Paper} 
        elevation={0}
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          bgcolor: 'white'
        }}
      >
        {/* Mobile logo (visible only on small screens) */}
        <Box 
          className="mobile-brand" 
          sx={{ 
            display: { xs: 'flex', md: 'none' }, 
            mb: 4 
          }}
        >
          <img 
            src={logo} 
            alt="MedTrans Express Inc." 
            style={{ maxWidth: '180px', height: 'auto' }} 
          />
          <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1, fontStyle: 'italic' }}>
            Your partner in the wellness process
          </Typography>
        </Box>

        <Container maxWidth="xs">
          <Box className="login-animation" sx={{ mb: 5, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#004080' }}>
              Welcome <span style={{ color: '#4caf50' }}>Back</span>
            </Typography>
          </Box>

          {loginError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {loginError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Email or Username
              </Typography>
              <TextField
                fullWidth
                id="username"
                name="username"
                variant="outlined"
                placeholder="Enter your email or username"
                autoComplete="username"
                aria-label="Email or Username"
                aria-required="true"
                inputProps={{
                  'aria-describedby': errors.username ? 'username-error' : undefined
                }}
                {...register('username')}
                error={!!errors.username}
                helperText={errors.username?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Password
              </Typography>
              <TextField
                fullWidth
                id="password"
                name="password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-label="Password"
                aria-required="true"
                inputProps={{
                  'aria-describedby': errors.password ? 'password-error' : undefined
                }}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link 
                href="#" 
                underline="none" 
                color="textSecondary" 
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: '#4caf50'
                  }
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              aria-label="Sign in to your account"
              sx={{
                mt: 2,
                mb: 3,
                py: 1.5,
                bgcolor: '#4caf50',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(76, 175, 80, 0.2)',
                '&:hover': {
                  bgcolor: '#43a047',
                  boxShadow: '0 6px 15px rgba(76, 175, 80, 0.3)',
                },
                '&.Mui-disabled': {
                  bgcolor: '#a5d6a7',
                  color: 'white',
                }
              }}
            >
              Sign in
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No account?{' '}
                <Link 
                  component={RouterLink}
                  to="/register"
                  underline="none" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#004080',
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: '#4caf50'
                    }
                  }}
                >
                  sign up
                </Link>
              </Typography>
            </Box>
          </form>
        </Container>
      </Box>
    </Box>
  );
};

export default Login; 