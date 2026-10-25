import React from 'react';

export default function AdminTopBar({
  currentUser,
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse,
  onToggleMobile,
  onLogout,
  onOpenProfile
}) {
  const tabTitles = {
    dashboard: { title: 'Executive KPI Dashboard', icon: 'fa-solid fa-chart-pie', category: 'Analytics' },
    audit: { title: 'Security Audit Logs', icon: 'fa-solid fa-shield-halved', category: 'System' },
    browse: { title: 'Fleet Showroom & Catalog', icon: 'fa-solid fa-car-rear', category: 'Storefront' },
    fleet: { title: 'Fleet Inventory Logistics', icon: 'fa-solid fa-warehouse', category: 'Operations' },
    bookings: { title: 'Bookings & Reservations', icon: 'fa-solid fa-calendar-days', category: 'Operations' },
    rentals: { title: 'Active Rentals & Handover', icon: 'fa-solid fa-key', category: 'Operations' },
    maintenance: { title: 'Vehicle Maintenance & Service', icon: 'fa-solid fa-screwdriver-wrench', category: 'Operations' },
    payments: { title: 'Payments, Fines & Invoices', icon: 'fa-solid fa-credit-card', category: 'Finance' },
    users: { title: 'User Accounts & Access Control', icon: 'fa-solid fa-user-shield', category: 'System' },
    customers: { title: 'Customer Directory & Verification', icon: 'fa-solid fa-users-gear', category: 'Clients' },
    branches: { title: 'Branches & Hub Management', icon: 'fa-solid fa-building', category: 'Facilities' },
    profile: { title: 'Administrator Profile Settings', icon: 'fa-solid fa-id-badge', category: 'Account' }
  };

  const currentTabInfo = tabTitles[activeTab] || {
    title: activeTab,
    icon: 'fa-solid fa-table-columns',
    category: 'Admin'
  };

  const adminName = currentUser?.FullName || currentUser?.Username || 'Admin';
  const adminInitial = adminName.charAt(0).toUpperCase();

  return (
    <header className="admin-top-bar">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="admin-top-bar-left">
        {/* Mobile Hamburger Button */}
        <button
          className="admin-top-bar-mobile-btn"
          onClick={onToggleMobile}
          title="Open Menu"
          type="button"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          className="admin-top-bar-collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Side Panel' : 'Collapse Side Panel'}
          type="button"
        >
          <i className={`fa-solid ${isCollapsed ? 'fa-bars' : 'fa-bars-staggered'}`}></i>
        </button>

        {/* Breadcrumb Navigation */}
        <div className="admin-top-bar-breadcrumb">
          <span className="breadcrumb-category">
            <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px', color: 'var(--yellow)' }}></i>
            {currentTabInfo.category}
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-title">
            <i className={currentTabInfo.icon} style={{ marginRight: '6px', fontSize: '13px' }}></i>
            {currentTabInfo.title}
          </span>
        </div>
      </div>

      {/* Right: Storefront Switcher, System Tag, Profile Capsule */}
      <div className="admin-top-bar-right">
        {/* Storefront View Switcher Button */}
        {activeTab !== 'browse' ? (
          <button
            className="btn-storefront-toggle"
            onClick={() => setActiveTab('browse')}
            title="Open customer-facing vehicle rental catalog"
            type="button"
          >
            <i className="fa-solid fa-store"></i>
            <span>Customer View</span>
          </button>
        ) : (
          <button
            className="btn-storefront-toggle active"
            onClick={() => setActiveTab('dashboard')}
            title="Return to Executive KPI Dashboard"
            type="button"
          >
            <i className="fa-solid fa-chart-pie"></i>
            <span>Back to Dashboard</span>
          </button>
        )}

        {/* System Environment Chip */}
        <div className="admin-system-chip">
          <span className="system-chip-dot"></span>
          <span>ADBMS Production Core</span>
        </div>

        {/* Admin Profile Capsule */}
        <div 
          className="admin-top-bar-user clickable"
          onClick={onOpenProfile}
          title="Open Profile Settings"
        >
          <div className="admin-top-avatar">
            {adminInitial}
          </div>
          <div className="admin-top-user-info">
            <span className="admin-top-username">{adminName}</span>
            <span className="admin-top-badge">Administrator</span>
          </div>
          <button
            className="admin-top-logout"
            onClick={(e) => {
              e.stopPropagation();
              onLogout();
            }}
            title="Sign Out"
            type="button"
          >
            <i className="fa-solid fa-power-off"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
