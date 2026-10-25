import React from 'react';

export default function Header({ currentUser, onOpenLogin, onLogout, onOpenProfile }) {
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
              ? `Signed in as ${currentUser.RoleName}${currentUser.BranchName ? ` • ${currentUser.BranchName}` : ''}`
              : 'Sri Lanka Vehicle Rentals • Premium Fleet Logistics'}
          </div>
        </div>
      </div>

      <div className="header-actions">
        {currentUser ? (
          <div 
            className="user-profile-capsule clickable" 
            onClick={onOpenProfile}
            title="Open Profile & Settings"
            style={{ cursor: 'pointer' }}
          >
            <div className="user-avatar">
              {currentUser.FullName ? currentUser.FullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser.FullName || currentUser.Username}</span>
              <span className="user-role-tag">
                <i className="fa-solid fa-user-gear" style={{ marginRight: '3px', fontSize: '10px' }}></i>
                {currentUser.RoleName}{currentUser.BranchName ? ` • ${currentUser.BranchName}` : ' • Profile'}
              </span>
            </div>
            <button 
              className="btn-profile-shortcut-pill"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenProfile) onOpenProfile();
              }}
              title="Edit Profile"
            >
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
            <button 
              className="btn-logout" 
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }} 
              title="Sign Out"
            >
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