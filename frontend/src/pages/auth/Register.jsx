import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Container, InputGroup, ProgressBar } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/logo.png';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCheck, faTimes, faInfoCircle, faUser, faEnvelope, faLock, faPhone, faImage } from '@fortawesome/free-solid-svg-icons';
import { isAuthenticated } from '@/utils/authUtils';

// Import or create a custom CSS file for Register
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
  const { register, handleSubmit, control, watch, formState: { errors }, setValue } = useForm({
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
  
  // Phone placeholder
  const phonePlaceholder = 4441234567;
  
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
          toast.error("Image too large. Maximum size is 5MB");
          return;
        }
        
        if (!file.type.match(/image.*/)) {
          toast.error("Please select an image file");
          return;
        }
        
        try {
          const profileImageBase64 = await compressImage(file);
          const userData = {
            ...registerData,
            profile_image: profileImageBase64
          };
          
          const response = await registerUser(userData);
          handleRegistrationSuccess();
        } catch (error) {
          handleRegisterError(error);
        }
      } else {
        // Register without profile image
        try {
          const response = await registerUser(registerData);
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
    toast.success("Registration successful! Your account is pending approval.");
    
    // Redirect to login page after 3 seconds
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };
  
  const handleRegisterError = (error) => {
    console.error('Registration error:', error);
    setRegisterError(error.message);
    toast.error(error.message || "Registration failed. Please try again.");
    
    // Set field-specific errors if available
    if (error.errors && Array.isArray(error.errors)) {
      const newFieldErrors = {};
      error.errors.forEach(err => {
        newFieldErrors[err.field] = err.message;
        toast.error(`${err.field}: ${err.message}`);
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
    <div className="register-page d-flex min-vh-100 bg-light">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Left side with logo and background */}
      <div className="register-left-panel d-none d-md-flex flex-column align-items-center justify-content-center position-relative"
        style={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, #004080 0%, #0078bf 100%)',
          padding: '1rem', 
          color: 'white'
        }}>
        <div className="login-animation position-absolute text-center" style={{ 
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)', 
          width: '100%',
          maxWidth: '400px',
          padding: '0.5rem'
        }}>
          <img 
            src={logo} 
            alt="MedTrans Express Inc." 
            style={{ 
              maxWidth: '80%', 
              height: 'auto', 
              marginBottom: '1rem' 
            }} 
          />
          <p className="mt-2 fw-light fst-italic fs-5">Your partner in the wellness process</p>
        </div>
      </div>

      {/* Right side with register form */}
      <div className="register-right-panel d-flex flex-column justify-content-center p-3 p-md-4 bg-white" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Mobile logo (visible only on small screens) */}
        <div className="mobile-brand d-flex d-md-none flex-column align-items-center mb-4">
          <img 
            src={logo} 
            alt="MedTrans Express Inc." 
            style={{ maxWidth: '180px', height: 'auto' }} 
          />
          <p className="mt-1 text-muted fst-italic small">Your partner in the wellness process</p>
        </div>

        <Container className="py-2" style={{ maxWidth: '700px' }}>
          <div className="login-animation text-center mb-4">
            <h2 className="fw-bold">
              <span className="text-primary">Create</span> <span className="text-success">Account</span>
            </h2>
            <p className="text-muted">Please fill in your information to create your account</p>
          </div>

          {registrationSuccess && (
            <div className="alert alert-success mb-3">
              Registration successful! Your account is pending approval. You will be redirected to the login page.
            </div>
          )}

          {registerError && !registrationSuccess && (
            <div className="alert alert-danger mb-3">
              {registerError}
            </div>
          )}

          {!registrationSuccess && (
            <Card className="custom-card shadow-sm border-0 rounded-4">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit(onSubmit)}>
                  {/* Personal Information Section */}
                  <div className="form-section mb-4">
                    <h5 className="section-heading mb-3">
                      <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                      Personal Information
                    </h5>
                    <div className="section-content">
                      <Row className="mb-3">
                        <Col xs={12} sm={6} className="mb-3 mb-sm-0">
                          <Form.Group>
                            <Form.Label className="fw-medium">First Name</Form.Label>
                            <Form.Control
                              type="text"
                              id="first_name"
                              name="first_name"
                              placeholder="Enter your first name"
                              autoComplete="given-name"
                              isInvalid={!!errors.first_name || !!fieldErrors.first_name}
                              {...register('first_name')}
                              className="custom-input rounded-3"
                            />
                            {(errors.first_name || fieldErrors.first_name) && (
                              <Form.Control.Feedback type="invalid">
                                {errors.first_name?.message || fieldErrors.first_name}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>

                        <Col xs={12} sm={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium">Last Name</Form.Label>
                            <Form.Control
                              type="text"
                              id="last_name"
                              name="last_name"
                              placeholder="Enter your last name"
                              autoComplete="family-name"
                              isInvalid={!!errors.last_name || !!fieldErrors.last_name}
                              {...register('last_name')}
                              className="custom-input rounded-3"
                            />
                            {(errors.last_name || fieldErrors.last_name) && (
                              <Form.Control.Feedback type="invalid">
                                {errors.last_name?.message || fieldErrors.last_name}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Sex</Form.Label>
                        <div className="mt-2 d-flex gap-4">
                          {['Male', 'Female'].map((option) => (
                            <Form.Check
                              key={option}
                              type="radio"
                              id={`sex-${option.toLowerCase()}`}
                              label={option}
                              value={option}
                              {...register('sex')}
                              isInvalid={!!errors.sex || !!fieldErrors.sex}
                              className="custom-radio"
                            />
                          ))}
                        </div>
                        {(errors.sex || fieldErrors.sex) && (
                          <Form.Control.Feedback type="invalid" className="d-block">
                            {errors.sex?.message || fieldErrors.sex}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </div>
                  </div>

                  <hr className="section-divider my-4" />

                  {/* Account Information Section */}
                  <div className="form-section mb-4">
                    <h5 className="section-heading mb-3">
                      <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                      Account Information
                    </h5>
                    <div className="section-content">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Username</Form.Label>
                        <Form.Control
                          type="text"
                          id="username"
                          name="username"
                          placeholder="Choose a username"
                          autoComplete="username"
                          isInvalid={!!errors.username || !!fieldErrors.username}
                          {...register('username')}
                          className="custom-input rounded-3"
                        />
                        <Form.Text className="text-muted">
                          Username must be at least 3 characters long
                        </Form.Text>
                        {(errors.username || fieldErrors.username) && (
                          <Form.Control.Feedback type="invalid">
                            {errors.username?.message || fieldErrors.username}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Email</Form.Label>
                        <Form.Control
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          isInvalid={!!errors.email || !!fieldErrors.email}
                          {...register('email')}
                          className="custom-input rounded-3"
                        />
                        {(errors.email || fieldErrors.email) && (
                          <Form.Control.Feedback type="invalid">
                            {errors.email?.message || fieldErrors.email}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </div>
                  </div>

                  <hr className="section-divider my-4" />

                  {/* Security Section */}
                  <div className="form-section mb-4">
                    <h5 className="section-heading mb-3">
                      <FontAwesomeIcon icon={faLock} className="me-2 text-primary" />
                      Security
                    </h5>
                    <div className="section-content">
                      <Row className="mb-3">
                        <Col xs={12} sm={6} className="mb-3 mb-sm-0">
                          <Form.Group>
                            <Form.Label className="fw-medium">Password</Form.Label>
                            <InputGroup hasValidation>
                              <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="Create a password"
                                autoComplete="new-password"
                                isInvalid={!!errors.password || !!fieldErrors.password}
                                {...register('password')}
                                className="custom-input rounded-start-3"
                              />
                              <Button 
                                variant="outline-secondary" 
                                onClick={handleTogglePassword}
                                className="custom-password-button rounded-end-3"
                              >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                              </Button>
                              {(errors.password || fieldErrors.password) && (
                                <Form.Control.Feedback type="invalid">
                                  {errors.password?.message || fieldErrors.password}
                                </Form.Control.Feedback>
                              )}
                            </InputGroup>
                            {watchPassword && (
                              <div className="mt-2">
                                <div className="d-flex justify-content-between mb-1">
                                  <small>Password strength: <span className={`text-${passwordStrength.variant}`}>{passwordStrength.message}</span></small>
                                  <small className={`text-${passwordStrength.variant}`}>{passwordStrength.score}/5</small>
                                </div>
                                <ProgressBar 
                                  now={passwordStrength.score * 20} 
                                  variant={passwordStrength.variant} 
                                  style={{ height: '6px' }}
                                  className="custom-progress"
                                />
                              </div>
                            )}
                          </Form.Group>
                        </Col>

                        <Col xs={12} sm={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium">Confirm Password</Form.Label>
                            <InputGroup hasValidation>
                              <Form.Control
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                isInvalid={!!errors.confirmPassword}
                                {...register('confirmPassword')}
                                className="custom-input rounded-start-3"
                              />
                              <Button 
                                variant="outline-secondary" 
                                onClick={handleToggleConfirmPassword}
                                className="custom-password-button rounded-end-3"
                              >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                              </Button>
                              {errors.confirmPassword && (
                                <Form.Control.Feedback type="invalid">
                                  {errors.confirmPassword?.message}
                                </Form.Control.Feedback>
                              )}
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </div>

                  <hr className="section-divider my-4" />

                  {/* Contact Information Section */}
                  <div className="form-section mb-4">
                    <h5 className="section-heading mb-3">
                      <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
                      Contact Information
                    </h5>
                    <div className="section-content">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Phone Number</Form.Label>
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <InputGroup hasValidation>
                              <InputGroup.Text className="custom-input-group-text rounded-start-3">+1</InputGroup.Text>
                              <Form.Control
                                type="text"
                                id="phone"
                                placeholder={formatPhoneNumber(phonePlaceholder.toString())}
                                autoComplete="tel"
                                isInvalid={!!errors.phone || !!fieldErrors.phone}
                                value={field.value ? formatPhoneNumber(field.value) : ''}
                                onChange={(e) => {
                                  // Remove all non-digits and limit to 10 digits
                                  const digits = e.target.value.replace(/\D/g, '').substring(0, 10);
                                  field.onChange(digits);
                                }}
                                className="custom-input rounded-end-3"
                              />
                              {(errors.phone || fieldErrors.phone) && (
                                <Form.Control.Feedback type="invalid">
                                  {errors.phone?.message || fieldErrors.phone}
                                </Form.Control.Feedback>
                              )}
                            </InputGroup>
                          )}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <hr className="section-divider my-4" />

                  {/* Profile Picture Section */}
                  <div className="form-section mb-4">
                    <h5 className="section-heading mb-3">
                      <FontAwesomeIcon icon={faImage} className="me-2 text-primary" />
                      Profile Picture
                    </h5>
                    <div className="section-content">
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-medium">Profile Picture (Optional)</Form.Label>
                        <Form.Control
                          type="file"
                          id="profile_image"
                          name="profile_image"
                          accept="image/*"
                          className="custom-file-input rounded-3"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) { // 5MB
                                toast.error("Image too large. Maximum size is 5MB");
                                e.target.value = '';
                                return;
                              }
                              
                              if (!file.type.match(/image.*/)) {
                                toast.error("Please select an image file");
                                e.target.value = '';
                                return;
                              }
                              
                              register('profile_image').onChange(e);
                            }
                          }}
                        />
                        <Form.Text className="text-muted">
                          Upload a profile picture (max 5MB, will be compressed)
                        </Form.Text>
                      </Form.Group>
                    </div>
                  </div>

                  <div className="d-grid mb-3">
                    <Button
                      type="submit"
                      variant="success"
                      disabled={loading}
                      className="custom-button py-2 rounded-3 fw-medium"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="mb-0 text-muted">
                      Already have an account?{' '}
                      <RouterLink to="/login" className="text-decoration-none fw-medium text-primary custom-link">
                        Sign in
                      </RouterLink>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Register; 