import React from 'react';

export default function Header({ currentUser, onOpenLogin, onLogout }) {
  return (
    <header className="header">
      <div>
        <h1 className="title">AutoManager Pro</h1>
        <div style={{ color: 'var(--text-muted)' }}>
          {currentUser 
            ? `Signed in as ${currentUser.RoleName}`
            : 'Premium Island-Wide Vehicle Rental Services • Powered by ADBMS'}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
