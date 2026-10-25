import React from 'react';

export default function Header({ 
  currentUser, 
  activeTab = 'browse', 
  setActiveTab, 
  onOpenLogin, 
  onLogout, 
  onOpenProfile,
  counts = {}
}) {
  return (
    <header className="header">
      <div 
        className="brand-box"
        onClick={() => setActiveTab && setActiveTab('browse')}
        role="button"
        tabIndex={0}
      >
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

      {/* Primary Top Nav Bar */}
      <nav className="header-nav-bar" aria-label="Main Navigation">
        <button 
          className={`nav-pill-btn ${activeTab === 'browse' ? 'active-pill' : 'ghost-pill'}`}
          onClick={() => setActiveTab && setActiveTab('browse')}
          type="button"
          title="Browse available vehicle fleet"
        >
          <i className="fa-solid fa-car"></i>
          <span>Browse Fleet</span>
        </button>

        <button 
          className={`nav-pill-btn ${activeTab === 'branches' ? 'active-pill' : 'ghost-pill'}`}
          onClick={() => setActiveTab && setActiveTab('branches')}
          type="button"
          title="View rental branches & operational hubs"
        >
          <i className="fa-solid fa-location-dot nav-pin-icon"></i>
          <span>Branches & Hubs</span>
        </button>

        {currentUser && currentUser.RoleName === 'Customer' && (
          <>
            <button 
              className={`nav-pill-btn ${activeTab === 'my_bookings' ? 'active-pill' : 'ghost-pill'}`}
              onClick={() => setActiveTab && setActiveTab('my_bookings')}
              type="button"
            >
              <i className="fa-solid fa-calendar-check"></i>
              <span>My Bookings</span>
              {counts.myBookingsCount > 0 && <span className="nav-tab-badge">{counts.myBookingsCount}</span>}
            </button>
            <button 
              className={`nav-pill-btn ${activeTab === 'my_invoices' ? 'active-pill' : 'ghost-pill'}`}
              onClick={() => setActiveTab && setActiveTab('my_invoices')}
              type="button"
            >
              <i className="fa-solid fa-file-invoice-dollar"></i>
              <span>Invoices</span>
            </button>
          </>
        )}
      </nav>

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