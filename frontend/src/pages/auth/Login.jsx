import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/logo.png';
import loginBackground from '../../assets/login_background.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import './Login.css';

// Validation schema for login form
const loginSchema = yup.object().shape({
  username: yup.string().required('Email or username is required'),
  password: yup.string().required('Password is required')
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Only redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate, isAuthenticated]);

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
    <div className="login-page">
      <div className="login-container">
        {/* Left panel with background image */}
        <div className="login-left-panel">
          <div className="login-brand-container">
            <img src={logo} alt="MedTrans Express Inc." className="login-logo" />
            <h1 className="login-welcome">MedTrans Express</h1>
            <p className="login-slogan">Your partner in the wellness process</p>
          </div>
        </div>
        
        {/* Right panel with login form */}
        <div className="login-right-panel">
          <div className="login-form-wrapper">
            <div className="login-header">
              <h2>Welcome <span className="accent-text">Back</span></h2>
              <p className="login-subheader">Sign in to continue to MedTrans Express</p>
            </div>
            
            {loginError && (
              <div className="login-error">
                <FontAwesomeIcon icon={faExclamationCircle} /> {loginError}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Email or Username</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="username"
                   
                    autoComplete="username"
                    className={errors.username ? 'error' : ''}
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <span className="error-message">{errors.username.message}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
            
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                   
                    autoComplete="current-password"
                    className={errors.password ? 'error' : ''}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={handleTogglePassword}
                    aria-label="Toggle password visibility"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password.message}</span>
                )}
              </div>
              
              <div className="form-options">
                <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
              </div>
              
              <button type="submit" className="login-button">
                Sign in
              </button>
              
              <div className="signup-link">
                Don't have an account? <Link to="/register">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 