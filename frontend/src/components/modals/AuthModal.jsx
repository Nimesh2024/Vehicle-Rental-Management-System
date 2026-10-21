import React, { useState, useMemo, useRef } from 'react';

// Validation helpers
export const validateUsername = (val) => {
  if (!val || !val.trim()) return 'Username is required';
  const clean = val.trim();
  if (clean.length < 3) return 'Username must be at least 3 characters';
  if (clean.length > 30) return 'Username cannot exceed 30 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) return 'Only letters, numbers, and underscores permitted';
  return null;
};

export const validatePassword = (val, isRegister = false) => {
  if (!val) return 'Password is required';
  if (isRegister && val.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const getPasswordStrength = (pwd = '') => {
  if (!pwd) return { score: 0, label: 'None', level: 'empty' };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 8) score += 1;
  if (/[0-9]/.test(pwd) && /[a-zA-Z]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd) || /[A-Z]/.test(pwd)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', level: 'weak' };
  if (score <= 3) return { score: 2, label: 'Moderate', level: 'moderate' };
  return { score: 3, label: 'Strong', level: 'strong' };
};

export const validateName = (val, label = 'Name') => {
  if (!val || !val.trim()) return `${label} is required`;
  const clean = val.trim();
  if (clean.length < 2) return `${label} must be at least 2 letters`;
  if (!/^[a-zA-Z\s.-]+$/.test(clean)) return `${label} should contain letters only`;
  return null;
};

export const validateNIC = (val) => {
  if (!val || !val.trim()) return 'NIC or Passport is required';
  const clean = val.trim();
  // Sri Lanka Old NIC (9 digits + V/X), New NIC (12 digits), or Passport (1-2 letters + 7-8 digits)
  const isOldNIC = /^[0-9]{9}[vVxX]$/.test(clean);
  const isNewNIC = /^[0-9]{12}$/.test(clean);
  const isPassport = /^[a-zA-Z]{1,2}[0-9]{7,8}$/.test(clean);
  if (!isOldNIC && !isNewNIC && !isPassport) {
    return 'Enter valid 12-digit NIC, 9-digit+V, or Passport';
  }
  return null;
};

export const calculateAge = (dobString) => {
  if (!dobString) return 0;
  const birth = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const validateDOB = (dobString) => {
  if (!dobString) return 'Date of birth is required';
  const birth = new Date(dobString);
  const today = new Date();
  if (isNaN(birth.getTime())) return 'Invalid date format';
  if (birth > today) return 'Date of birth cannot be in the future';
  const age = calculateAge(dobString);
  if (age < 18) return `Must be at least 18 years old to rent (Current: ${age > 0 ? age : 0})`;
  if (age > 100) return 'Please enter a valid date of birth';
  return null;
};

export const validatePhone = (val) => {
  if (!val || !val.trim()) return 'Phone number is required';
  const clean = val.trim().replace(/[\s-]/g, '');
  // Sri Lanka format: +947XXXXXXXX, 07XXXXXXXX, or international format min 10 digits
  const phonePattern = /^(\+94|0)?[0-9]{9,10}$/;
  if (!phonePattern.test(clean)) {
    return 'Enter valid phone (e.g., +94771234567 or 0771234567)';
  }
  return null;
};

export const validateEmail = (val) => {
  if (!val || !val.trim()) return 'Email address is required';
  const clean = val.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailPattern.test(clean)) return 'Please enter a valid email address';
  return null;
};

export const validateAddress = (val) => {
  if (!val || !val.trim()) return 'Residential address is required';
  if (val.trim().length < 5) return 'Address must be at least 5 characters';
  return null;
};

export default function AuthModal({
  isOpen,
  onClose,
  isRegisterMode,
  setIsRegisterMode,
  authPromptMsg,
  loginError,
  setLoginError,
  loginLoading,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  onLoginSubmit,
  onRegisterSubmit
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation States
  const [loginTouched, setLoginTouched] = useState({});
  const [loginSubmitted, setLoginSubmitted] = useState(false);

  const [regTouched, setRegTouched] = useState({});
  const [regSubmitted, setRegSubmitted] = useState(false);
  const [formValidationNotice, setFormValidationNotice] = useState('');

  // Compute live login errors
  const loginErrors = useMemo(() => {
    return {
      username: validateUsername(loginForm.username),
      password: validatePassword(loginForm.password, false)
    };
  }, [loginForm.username, loginForm.password]);

  // Compute live register errors
  const regErrors = useMemo(() => {
    return {
      username: validateUsername(registerForm.username),
      password: validatePassword(registerForm.password, true),
      firstName: validateName(registerForm.firstName, 'First name'),
      lastName: validateName(registerForm.lastName, 'Last name'),
      nic: validateNIC(registerForm.nic),
      dob: validateDOB(registerForm.dob),
      phone: validatePhone(registerForm.phone),
      email: validateEmail(registerForm.email),
      address: validateAddress(registerForm.address)
    };
  }, [registerForm]);

  const passwordStrength = useMemo(() => {
    return getPasswordStrength(registerForm.password);
  }, [registerForm.password]);

  const customerAge = useMemo(() => {
    return calculateAge(registerForm.dob);
  }, [registerForm.dob]);

  if (!isOpen) return null;

  // Intercept and validate Login submission
  const handleInternalLoginSubmit = (e) => {
    e.preventDefault();
    setLoginSubmitted(true);
    setFormValidationNotice('');

    const hasErrors = Object.values(loginErrors).some((err) => err !== null);
    if (hasErrors) {
      setFormValidationNotice('Please provide your valid username and password to sign in.');
      return;
    }

    onLoginSubmit(e);
  };

  // Intercept and validate Registration submission
  const handleInternalRegisterSubmit = (e) => {
    e.preventDefault();
    setRegSubmitted(true);
    setFormValidationNotice('');

    const errorKeys = Object.keys(regErrors).filter((key) => regErrors[key] !== null);
    if (errorKeys.length > 0) {
      setFormValidationNotice(`Please correct the ${errorKeys.length} highlighted ${errorKeys.length === 1 ? 'error' : 'errors'} before submitting.`);
      
      // Auto-focus first invalid input
      const firstErrorField = document.getElementById(`reg-${errorKeys[0].toLowerCase()}`);
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }

    onRegisterSubmit(e);
  };

  const handleTabChange = (toRegister) => {
    setIsRegisterMode(toRegister);
    setLoginError('');
    setFormValidationNotice('');
    setShowForgotNotice(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="auth-header">
          <div className="auth-header-left">
            <div className="auth-brand-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="auth-title">
                {isRegisterMode ? 'Create an Account' : 'Welcome Back'}
              </h3>
              <p className="auth-subtitle">
                {isRegisterMode 
                  ? 'Register with our luxury vehicle rental fleet in seconds'
                  : 'Enter your credentials to access your account & rentals'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>

        {/* Global Prompt / Session Notice */}
        {authPromptMsg && (
          <div className="auth-prompt-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{authPromptMsg}</span>
          </div>
        )}

        {/* Server Error Alert */}
        {loginError && (
          <div className="alert-error auth-error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{loginError}</span>
          </div>
        )}

        {/* Client Validation Summary Banner */}
        {formValidationNotice && (
          <div className="auth-validation-notice-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{formValidationNotice}</span>
          </div>
        )}

        {/* Modal Tab Switcher */}
        <div className="auth-modal-tabs">
          <button 
            type="button" 
            className={`auth-tab-btn ${!isRegisterMode ? 'active' : ''}`}
            onClick={() => handleTabChange(false)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${isRegisterMode ? 'active' : ''}`}
            onClick={() => handleTabChange(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            New Customer
          </button>
        </div>

        {/* Forgot Password Notice Box */}
        {showForgotNotice && !isRegisterMode && (
          <div className="forgot-password-box">
            <div className="forgot-header">
              <span className="forgot-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Password Recovery Assistance
              </span>
              <button 
                type="button" 
                className="forgot-close" 
                onClick={() => setShowForgotNotice(false)}
                title="Dismiss"
              >✕</button>
            </div>
            <p className="forgot-body">
              For security compliance, user credential resets are managed by authorized branch personnel. 
              Please reach out to our support desk at <strong style={{ color: 'var(--yellow)' }}>support@rento.lk</strong> or call <strong style={{ color: '#fff' }}>+94 11 234 5670</strong>.
            </p>
          </div>
        )}

        {/* ========================================================
            REGISTRATION FORM (WITH VALIDATION FEEDBACK)
            ======================================================== */}
        {isRegisterMode ? (
          <form onSubmit={handleInternalRegisterSubmit} className="auth-form" noValidate>
            <div className="auth-section-divider">
              <span>Account Credentials</span>
            </div>

            <div className="form-grid-2">
              {/* Username Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-username">
                  Username *
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input 
                    id="reg-username"
                    placeholder="e.g. kasun_perera" 
                    required 
                    autoComplete="username"
                    className={`form-input form-input-with-icon ${
                      (regTouched.username || regSubmitted) 
                        ? (regErrors.username ? 'is-invalid' : 'is-valid') 
                        : ''
                    }`}
                    value={registerForm.username} 
                    onBlur={() => setRegTouched((prev) => ({ ...prev, username: true }))}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} 
                  />
                  {(regTouched.username || regSubmitted) && (
                    <span className="input-status-icon">
                      {regErrors.username ? (
                        <svg className="icon-error" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      ) : (
                        <svg className="icon-success" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </span>
                  )}
                </div>
                {(regTouched.username || regSubmitted) && regErrors.username && (
                  <div className="field-feedback error">{regErrors.username}</div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password *
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input 
                    id="reg-password"
                    placeholder="Min. 6 characters" 
                    type={showRegisterPassword ? "text" : "password"}
                    required 
                    autoComplete="new-password"
                    className={`form-input form-input-with-icon form-input-with-toggle ${
                      (regTouched.password || regSubmitted) 
                        ? (regErrors.password ? 'is-invalid' : 'is-valid') 
                        : ''
                    }`}
                    value={registerForm.password} 
                    onBlur={() => setRegTouched((prev) => ({ ...prev, password: true }))}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} 
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    title={showRegisterPassword ? "Hide password" : "Show password"}
                  >
                    {showRegisterPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
                {/* Live Password Strength Meter */}
                {registerForm.password && (
                  <div className="pwd-strength-container">
                    <div className="pwd-strength-track">
                      <div className={`pwd-strength-fill ${passwordStrength.level}`} style={{ width: `${(passwordStrength.score / 3) * 100}%` }} />
                    </div>
                    <span className={`pwd-strength-text ${passwordStrength.level}`}>
                      Strength: {passwordStrength.label}
                    </span>
                  </div>
                )}
                {(regTouched.password || regSubmitted) && regErrors.password && (
                  <div className="field-feedback error">{regErrors.password}</div>
                )}
              </div>
            </div>

            <div className="auth-section-divider">
              <span>Personal Information</span>
            </div>

            <div className="form-grid-2">
              {/* First Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-firstname">First Name *</label>
                <div className="input-with-icon">
                  <input 
                    id="reg-firstname"
                    placeholder="e.g. Sunil" 
                    required 
                    className={`form-input ${
                      (regTouched.firstName || regSubmitted) 
                        ? (regErrors.firstName ? 'is-invalid' : 'is-valid') 
                        : ''
                    }`}
                    value={registerForm.firstName} 
                    onBlur={() => setRegTouched((prev) => ({ ...prev, firstName: true }))}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} 
                  />
                  {(regTouched.firstName || regSubmitted) && (
                    <span className="input-status-icon right-fixed">
                      {regErrors.firstName ? (
                        <svg className="icon-error" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      ) : (
                        <svg className="icon-success" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </span>
                  )}
                </div>
                {(regTouched.firstName || regSubmitted) && regErrors.firstName && (
                  <div className="field-feedback error">{regErrors.firstName}</div>
                )}
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-lastname">Last Name *</label>
                <div className="input-with-icon">
                  <input 
                    id="reg-lastname"
                    placeholder="e.g. Perera" 
                    required 
                    className={`form-input ${
                      (regTouched.lastName || regSubmitted) 
                        ? (regErrors.lastName ? 'is-invalid' : 'is-valid') 
                        : ''
                    }`}
                    value={registerForm.lastName} 
                    onBlur={() => setRegTouched((prev) => ({ ...prev, lastName: true }))}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} 
                  />
                  {(regTouched.lastName || regSubmitted) && (
                    <span className="input-status-icon right-fixed">
                      {regErrors.lastName ? (
                        <svg className="icon-error" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      ) : (
                        <svg className="icon-success" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </span>
                  )}
                </div>
                {(regTouched.lastName || regSubmitted) && regErrors.lastName && (
                  <div className="field-feedback error">{regErrors.lastName}</div>
                )}
              </div>
            </div>

            <div className="form-grid-2">
              {/* NIC / Passport */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-nic">NIC / Passport *</label>
                <div className="input-with-icon">
                  <input 
                    id="reg-nic"
                    placeholder="e.g. 199012345678 or 851234567V" 
                    required 
                    className={`form-input ${
                      (regTouched.nic || regSubmitted) 
                        ? (regErrors.nic ? 'is-invalid' : 'is-valid') 
                        : ''
                    }`}
                    value={registerForm.nic} 
                    onBlur={() => setRegTouched((prev) => ({ ...prev, nic: true }))}
                    onChange={(e) => setRegisterForm({ ...registerForm, nic: e.target.value })} 
                  />
                  {(regTouched.nic || regSubmitted) && (
                    <span className="input-status-icon right-fixed">
                      {regErrors.nic ? (
                        <svg className="icon-error" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      ) : (
                        <svg className="icon-success" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </span>
                  )}
                </div>
                {(regTouched.nic || regSubmitted) && regErrors.nic && (
                  <div className="field-feedback error">{regErrors.nic}</div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-dob">
                  Date of Birth * (18+ only)
                </label>
                <div className="input-with-icon">
                  <input 
                    id="reg-dob"
                    type="date" 
                    required 
                    className={`form-input ${
                      (regTouched.dob || regSubmitted) 
                        ? (regErrors.dob ? 'is-invalid' : 'is-valid') 
                        : ''
                    }`}
                    value={registerForm.dob} 
                    onBlur={() => setRegTouched((prev) => ({ ...prev, dob: true }))}
                    onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })} 
                  />
                </div>
                {(regTouched.dob || regSubmitted) && regErrors.dob ? (
                  <div className="field-feedback error">{regErrors.dob}</div>
                ) : (
                  registerForm.dob && customerAge >= 18 && (
                    <div className="field-feedback success">✓ Age: {customerAge} (Eligible for rental)</div>
                  )
                )}
              </div>
            </div>

            <div className="auth-section-divider">
              <span>Contact & Location</span>
            </div>

            <div className="form-grid-2">
              {/* Phone */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Phone Number *</label>
                <div className="input-with-icon">
                  <input 
                    id="reg-phone"
                    placeholder="+94 77 123 4567" 
                    required 
                    type="tel"
                    className={`form-input ${
                      (regTouched.phone || regSubmitted) 
                        ? (regErrors.phone ? 'is-invalid' : 'is-valid') 
                        : ''
                    }`}
                    value={registerForm.phone} 
                    onBlur={() => setRegTouched((prev) => ({ ...prev, phone: true }))}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} 
                  />
                  {(regTouched.phone || regSubmitted) && (
                    <span className="input-status-icon right-fixed">
                      {regErrors.phone ? (
                        <svg className="icon-error" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      ) : (
                        <svg className="icon-success" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </span>
                  )}
                </div>
                {(regTouched.phone || regSubmitted) && regErrors.phone && (
                  <div className="field-feedback error">{regErrors.phone}</div>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address *</label>
                <div className="input-with-icon">
                  <input 
                    id="reg-email"
                    placeholder="name@example.com" 
                    type="email" 
                    required 
                    autoComplete="email"
                    className={`form-input ${
                      (regTouched.email || regSubmitted) 
                        ? (regErrors.email ? 'is-invalid' : 'is-valid') 
                        : ''
                    }`}
                    value={registerForm.email} 
                    onBlur={() => setRegTouched((prev) => ({ ...prev, email: true }))}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} 
                  />
                  {(regTouched.email || regSubmitted) && (
                    <span className="input-status-icon right-fixed">
                      {regErrors.email ? (
                        <svg className="icon-error" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      ) : (
                        <svg className="icon-success" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </span>
                  )}
                </div>
                {(regTouched.email || regSubmitted) && regErrors.email && (
                  <div className="field-feedback error">{regErrors.email}</div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-address">Residential Address *</label>
              <div className="input-with-icon">
                <input 
                  id="reg-address"
                  placeholder="Street address, City, Province" 
                  required 
                  className={`form-input ${
                    (regTouched.address || regSubmitted) 
                      ? (regErrors.address ? 'is-invalid' : 'is-valid') 
                      : ''
                  }`}
                  value={registerForm.address} 
                  onBlur={() => setRegTouched((prev) => ({ ...prev, address: true }))}
                  onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })} 
                />
                {(regTouched.address || regSubmitted) && (
                  <span className="input-status-icon right-fixed">
                    {regErrors.address ? (
                      <svg className="icon-error" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    ) : (
                      <svg className="icon-success" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </span>
                )}
              </div>
              {(regTouched.address || regSubmitted) && regErrors.address && (
                <div className="field-feedback error">{regErrors.address}</div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-submit auth-submit-btn" 
              disabled={loginLoading} 
            >
              {loginLoading ? (
                <span className="btn-loading-flex">
                  <svg className="auth-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="4" />
                  </svg>
                  Processing Registration...
                </span>
              ) : (
                <span>Complete Registration &rarr;</span>
              )}
            </button>

            <div className="auth-switch-prompt">
              Already have an account?{' '}
              <button 
                type="button" 
                className="auth-link-btn"
                onClick={() => handleTabChange(false)}
              >
                Sign In
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================
             SIGN IN FORM (WITH VALIDATION FEEDBACK)
             ======================================================== */
          <form onSubmit={handleInternalLoginSubmit} className="auth-form" noValidate>
            {/* Username */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">Username or ID</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input 
                  id="login-username"
                  className={`form-input form-input-with-icon ${
                    (loginTouched.username || loginSubmitted) 
                      ? (loginErrors.username ? 'is-invalid' : 'is-valid') 
                      : ''
                  }`}
                  type="text" 
                  required
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onBlur={() => setLoginTouched((prev) => ({ ...prev, username: true }))}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
                {(loginTouched.username || loginSubmitted) && (
                  <span className="input-status-icon">
                    {loginErrors.username ? (
                      <svg className="icon-error" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    ) : (
                      <svg className="icon-success" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </span>
                )}
              </div>
              {(loginTouched.username || loginSubmitted) && loginErrors.username && (
                <div className="field-feedback error">{loginErrors.username}</div>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                <button 
                  type="button" 
                  className="forgot-password-link"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input 
                  id="login-password"
                  className={`form-input form-input-with-icon form-input-with-toggle ${
                    (loginTouched.password || loginSubmitted) 
                      ? (loginErrors.password ? 'is-invalid' : 'is-valid') 
                      : ''
                  }`}
                  type={showPassword ? "text" : "password"} 
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onBlur={() => setLoginTouched((prev) => ({ ...prev, password: true }))}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
              {(loginTouched.password || loginSubmitted) && loginErrors.password && (
                <div className="field-feedback error">{loginErrors.password}</div>
              )}
            </div>

            <div className="auth-extra-row">
              <label className="remember-me-label">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-submit auth-submit-btn"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <span className="btn-loading-flex">
                  <svg className="auth-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="4" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span>Sign In &rarr;</span>
              )}
            </button>

            <div className="auth-switch-prompt">
              Don't have an account?{' '}
              <button 
                type="button" 
                className="auth-link-btn"
                onClick={() => handleTabChange(true)}
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* Security / Compliance Footer */}
        <div className="auth-security-footer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>End-to-End Encrypted Session • Enterprise ADBMS Protection</span>
        </div>
      </div>
    </div>
  );
}
