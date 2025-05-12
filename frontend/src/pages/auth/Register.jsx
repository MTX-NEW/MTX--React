import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faUser, faEnvelope, faLock, faPhone, faImage, faExclamationCircle, faAddressCard, faShieldAlt, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';
import { isAuthenticated } from '@/utils/authUtils';
import './Register.css';

// Validation schema for register form
const registerSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  username: yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: yup.string()
    .required('Email is required')
    .email('Email must be valid'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  phone: yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  sex: yup.string()
    .required('Sex is required')
    .oneOf(['Male', 'Female'], 'Please select a valid option'),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: 'Too weak',
    variant: 'danger'
  });
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already authenticated
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  // Form configuration using react-hook-form with yup validation
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema),
    mode: "onChange"
  });

  // Watch password field for strength evaluation
  const watchPassword = watch("password", "");
  
  // Calculate password strength
  useEffect(() => {
    if (watchPassword) {
      const score = calculatePasswordStrength(watchPassword);
      updatePasswordStrength(score);
    } else {
      setPasswordStrength({
        score: 0,
        message: 'Too weak',
        variant: 'danger'
      });
    }
  }, [watchPassword]);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
    
    return Math.min(score, 5); // Max score is 5
  };

  // Update password strength indicator
  const updatePasswordStrength = (score) => {
    let strength = {
      score: score,
      message: '',
      variant: ''
    };
    
    switch(score) {
      case 0:
      case 1:
        strength.message = 'Too weak';
        strength.variant = 'danger';
        break;
      case 2:
        strength.message = 'Weak';
        strength.variant = 'warning';
        break;
      case 3:
        strength.message = 'Fair';
        strength.variant = 'info';
        break;
      case 4:
        strength.message = 'Good';
        strength.variant = 'primary';
        break;
      case 5:
        strength.message = 'Strong';
        strength.variant = 'success';
        break;
      default:
        strength.message = 'Too weak';
        strength.variant = 'danger';
    }
    
    setPasswordStrength(strength);
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Compress and resize image
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          // Calculate new dimensions (max 400px width/height while maintaining aspect ratio)
          let width = img.width;
          let height = img.height;
          const maxSize = 400;
          
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image to canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
          resolve(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setRegisterError(null);
      setFieldErrors({});
      
      // Remove confirm password as it's not needed in the API
      const { confirmPassword, ...registerData } = data;
      
      // Upload profile image if available
      if (data.profile_image && data.profile_image.length > 0) {
        const file = data.profile_image[0];
        
        if (file.size > 5 * 1024 * 1024) { // 5MB
          setRegisterError("Image too large. Maximum size is 5MB");
          return;
        }
        
        if (!file.type.match(/image.*/)) {
          setRegisterError("Please select an image file");
          return;
        }
        
        try {
          const profileImageBase64 = await compressImage(file);
          const userData = {
            ...registerData,
            profile_image: profileImageBase64
          };
          
          await registerUser(userData);
          handleRegistrationSuccess();
        } catch (error) {
          handleRegisterError(error);
        }
      } else {
        // Register without profile image
        try {
          await registerUser(registerData);
          handleRegistrationSuccess();
        } catch (error) {
          handleRegisterError(error);
        }
      }
    } catch (error) {
      handleRegisterError(error);
    }
  };
  
  const handleRegistrationSuccess = () => {
    setRegistrationSuccess(true);
    
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };
  
  const handleRegisterError = (error) => {
    console.error('Registration error:', error);
    setRegisterError(error.message || "Registration failed. Please try again.");
    
    // Set field-specific errors if available
    if (error.errors && Array.isArray(error.errors)) {
      const newFieldErrors = {};
      error.errors.forEach(err => {
        newFieldErrors[err.field] = err.message;
      });
      setFieldErrors(newFieldErrors);
    }
  };

  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value) => {
    if (!value) return '';
    
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left panel */}
        <div className="register-left-panel">
          <div className="register-brand-container">
            <img src={logo} alt="MedTrans Express Inc." className="register-logo" />
            <h1 className="register-welcome">MedTrans Express</h1>
            <p className="register-slogan">Your partner in the wellness process</p>
          </div>
        </div>
        
        {/* Right panel with register form */}
        <div className="register-right-panel">
          <div className="register-form-wrapper">
            <div className="register-header">
              <h2>Create <span className="accent-text">Account</span></h2>
              <p className="register-subheader">Fill in your information to create your account</p>
            </div>
            
            {registerError && !registrationSuccess && (
              <div className="register-error">
                <FontAwesomeIcon icon={faExclamationCircle} /> {registerError}
              </div>
            )}
            
            {registrationSuccess && (
              <div className="register-success">
                Registration successful! Your account is pending approval. Redirecting...
              </div>
            )}
            
            {!registrationSuccess && (
              <form onSubmit={handleSubmit(onSubmit)} className="register-form">
                <div className="form-section">
                  <h3 className="section-title">
                    <FontAwesomeIcon icon={faAddressCard} className="section-icon" />
                    Personal Information
                  </h3>
                  
                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="first_name">First Name</label>
                      <div className="input-wrapper">
                        <FontAwesomeIcon icon={faUser} className="input-icon" />
                        <input
                          type="text"
                          id="first_name"
                          className={errors.first_name || fieldErrors.first_name ? 'error' : ''}
                          {...register('first_name')}
                        />
                      </div>
                      {(errors.first_name || fieldErrors.first_name) && (
                        <span className="error-message">
                          {errors.first_name?.message || fieldErrors.first_name}
                        </span>
                      )}
                    </div>
                    
                    <div className="form-group half">
                      <label htmlFor="last_name">Last Name</label>
                      <div className="input-wrapper">
                        <FontAwesomeIcon icon={faUser} className="input-icon" />
                        <input
                          type="text"
                          id="last_name"
                          className={errors.last_name || fieldErrors.last_name ? 'error' : ''}
                          {...register('last_name')}
                        />
                      </div>
                      {(errors.last_name || fieldErrors.last_name) && (
                        <span className="error-message">
                          {errors.last_name?.message || fieldErrors.last_name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Sex</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          value="Male"
                          {...register('sex')}
                        />
                        <span>Male</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          value="Female"
                          {...register('sex')}
                        />
                        <span>Female</span>
                      </label>
                    </div>
                    {(errors.sex || fieldErrors.sex) && (
                      <span className="error-message">
                        {errors.sex?.message || fieldErrors.sex}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="form-section">
                  <h3 className="section-title">
                    <FontAwesomeIcon icon={faEnvelope} className="section-icon" />
                    Account Information
                  </h3>
                  
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <div className="input-wrapper">
                      <FontAwesomeIcon icon={faUser} className="input-icon" />
                      <input
                        type="text"
                        id="username"
                        className={errors.username || fieldErrors.username ? 'error' : ''}
                        {...register('username')}
                      />
                    </div>
                    {(errors.username || fieldErrors.username) && (
                      <span className="error-message">
                        {errors.username?.message || fieldErrors.username}
                      </span>
                    )}
                    <small className="form-hint">Username must be at least 3 characters long</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <div className="input-wrapper">
                      <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                      <input
                        type="email"
                        id="email"
                        className={errors.email || fieldErrors.email ? 'error' : ''}
                        {...register('email')}
                      />
                    </div>
                    {(errors.email || fieldErrors.email) && (
                      <span className="error-message">
                        {errors.email?.message || fieldErrors.email}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="form-section">
                  <h3 className="section-title">
                    <FontAwesomeIcon icon={faShieldAlt} className="section-icon" />
                    Security
                  </h3>
                  
                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="password">Password</label>
                      <div className="input-wrapper">
                        <FontAwesomeIcon icon={faLock} className="input-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          className={errors.password || fieldErrors.password ? 'error' : ''}
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
                      {(errors.password || fieldErrors.password) && (
                        <span className="error-message">
                          {errors.password?.message || fieldErrors.password}
                        </span>
                      )}
                      
                      {watchPassword && (
                        <div className="password-strength">
                          <div className="strength-info">
                            <span>Strength: <span className={passwordStrength.variant}>{passwordStrength.message}</span></span>
                            <span className={passwordStrength.variant}>{passwordStrength.score}/5</span>
                          </div>
                          <div className="strength-bar">
                            <div 
                              className={`strength-progress ${passwordStrength.variant}`} 
                              style={{ width: `${passwordStrength.score * 20}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group half">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <div className="input-wrapper">
                        <FontAwesomeIcon icon={faLock} className="input-icon" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          className={errors.confirmPassword ? 'error' : ''}
                          {...register('confirmPassword')}
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={handleToggleConfirmPassword}
                          aria-label="Toggle confirm password visibility"
                        >
                          <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <span className="error-message">
                          {errors.confirmPassword?.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3 className="section-title">
                    <FontAwesomeIcon icon={faPhoneAlt} className="section-icon" />
                    Contact Information
                  </h3>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-wrapper phone-wrapper">
                      <FontAwesomeIcon icon={faPhone} className="input-icon" />
                      <span className="phone-prefix">+1</span>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="text"
                            id="phone"
                            className={errors.phone || fieldErrors.phone ? 'error phone-input' : 'phone-input'}
                            value={field.value ? formatPhoneNumber(field.value) : ''}
                            onChange={(e) => {
                              // Remove non-digits and limit to 10 digits
                              const digits = e.target.value.replace(/\D/g, '').substring(0, 10);
                              field.onChange(digits);
                            }}
                          />
                        )}
                      />
                    </div>
                    {(errors.phone || fieldErrors.phone) && (
                      <span className="error-message">
                        {errors.phone?.message || fieldErrors.phone}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="form-section">
                  <h3 className="section-title">
                    <FontAwesomeIcon icon={faImage} className="section-icon" />
                    Profile Picture
                  </h3>
                  
                  <div className="form-group">
                    <label htmlFor="profile_image">Profile Picture (Optional)</label>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        id="profile_image"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            register('profile_image').onChange(e);
                          }
                        }}
                      />
                    </div>
                    <small className="form-hint">Max file size: 5MB (will be compressed)</small>
                  </div>
                </div>
                
                <button type="submit" className="register-button" disabled={loading}>
                  {loading ? 'Processing...' : 'Create Account'}
                </button>
                
                <div className="login-link">
                  Already have an account? <Link to="/login">Sign in</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 