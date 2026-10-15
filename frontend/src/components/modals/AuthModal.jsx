import React from 'react';

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
  onRegisterSubmit,
  onFillDemo
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{isRegisterMode ? 'New Customer Sign Up' : 'Account Sign In'}</h3>
            <div className="modal-subtitle">
              {isRegisterMode ? 'Member 1 Stored Procedure: RegisterCustomer()' : 'Secure ADBMS Stored Procedure Authentication'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {authPromptMsg && (
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.15)', 
            border: '1px solid rgba(59, 130, 246, 0.3)', 
            color: '#93c5fd', 
            padding: '0.75rem', 
            borderRadius: '0.75rem', 
            fontSize: '0.85rem', 
            marginBottom: '1.25rem' 
          }}>
            ℹ️ {authPromptMsg}
          </div>
        )}

        {loginError && (
          <div className="alert-error">
            <span>⚠️ {loginError}</span>
          </div>
        )}

        {/* Modal Tab Switcher */}
        <div className="auth-modal-tabs">
          <button 
            type="button" 
            className={`auth-tab-btn ${!isRegisterMode ? 'active' : ''}`}
            onClick={() => { setIsRegisterMode(false); setLoginError(''); }}
          >
            🔑 Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${isRegisterMode ? 'active' : ''}`}
            onClick={() => { setIsRegisterMode(true); setLoginError(''); }}
          >
            👤 New Customer
          </button>
        </div>

        {!isRegisterMode && (
          <div className="quick-demo-box">
            <div className="quick-demo-title">Quick Demo Login:</div>
            <div className="demo-chips">
              <button type="button" className="demo-chip" onClick={() => onFillDemo('admin_super', 'password123')}>
                👑 Admin
              </button>
              <button type="button" className="demo-chip" onClick={() => onFillDemo('kamal_mgr', 'password123')}>
                🏢 Manager
              </button>
              <button type="button" className="demo-chip" onClick={() => onFillDemo('sunil_perera', 'password123')}>
                👤 Customer
              </button>
            </div>
          </div>
        )}

        {isRegisterMode ? (
          <form onSubmit={onRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Login Credentials</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input 
                  placeholder="Username" 
                  required 
                  className="form-input" 
                  value={registerForm.username} 
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} 
                />
                <input 
                  placeholder="Password" 
                  type="password" 
                  required 
                  className="form-input" 
                  value={registerForm.password} 
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} 
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input 
                  placeholder="First Name" 
                  required 
                  className="form-input" 
                  value={registerForm.firstName} 
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} 
                />
                <input 
                  placeholder="Last Name" 
                  required 
                  className="form-input" 
                  value={registerForm.lastName} 
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} 
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">NIC / Passport & Date of Birth</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input 
                  placeholder="NIC Number" 
                  required 
                  className="form-input" 
                  value={registerForm.nic} 
                  onChange={(e) => setRegisterForm({ ...registerForm, nic: e.target.value })} 
                />
                <input 
                  type="date" 
                  required 
                  className="form-input" 
                  value={registerForm.dob} 
                  onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })} 
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Details</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input 
                  placeholder="Phone (+9477...)" 
                  required 
                  className="form-input" 
                  value={registerForm.phone} 
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} 
                />
                <input 
                  placeholder="Email Address" 
                  type="email" 
                  required 
                  className="form-input" 
                  value={registerForm.email} 
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} 
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input 
                placeholder="Residential Address" 
                required 
                className="form-input" 
                value={registerForm.address} 
                onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })} 
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit" 
              disabled={loginLoading} 
              style={{ marginTop: '0.5rem' }}
            >
              {loginLoading ? 'Executing RegisterCustomer SP...' : 'Register & Sign In (SP)'}
            </button>
          </form>
        ) : (
          <form onSubmit={onLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">Username</label>
              <input 
                id="login-username"
                className="form-input" 
                type="text" 
                required
                placeholder="Enter username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input 
                id="login-password"
                className="form-input" 
                type="password" 
                required
                placeholder="Enter password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loginLoading}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
