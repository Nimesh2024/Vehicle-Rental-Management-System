import React from 'react';

export default function Header({ currentUser, onOpenLogin, onLogout }) {
  return (
    <header className="header">
      <div className="brand-box">
        <div className="brand-logo-badge">
          <i className="fa-solid fa-car-side"></i>
          <span>RENTO</span>
        </div>
        <div className="brand-text">
          <div className="brand-title">
            AutoManager <span>Pro</span>
          </div>
          <div className="brand-tagline">
            {currentUser 
              ? `Signed in as ${currentUser.RoleName}`
              : 'Sri Lanka Vehicle Rentals • Powered by ADBMS'}
          </div>
        </div>
      </div>

      <div className="header-actions">
        {currentUser ? (
          <div className="user-profile-capsule">
            <div className="user-avatar">
              {currentUser.FullName ? currentUser.FullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser.FullName || currentUser.Username}</span>
              <span className="user-role-tag">{currentUser.RoleName}</span>
            </div>
            <button className="btn-logout" onClick={onLogout} title="Sign Out">
              Logout
            </button>
          </div>
        ) : (
          <button 
            id="login-btn"
            className="btn-login" 
            onClick={onOpenLogin}
          >
            <i className="fa-solid fa-user-lock"></i>
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
