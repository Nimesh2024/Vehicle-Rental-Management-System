import React, { useState, useEffect, useMemo } from 'react';

export default function AdminSidePanel({
  currentUser,
  activeTab,
  setActiveTab,
  counts = {},
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  onLogout
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (onToggleCollapse) onToggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);

  const {
    allVehiclesCount = 0,
    bookingsCount = 0,
    rentalsCount = 0,
    outstandingCount = 0,
    maintenanceCount = 0,
    customersCount = 0,
    auditLogsCount = 0,
    usersCount = 0
  } = counts;

  // Enterprise navigation categories
  const adminCategories = useMemo(() => [
    {
      group: 'Analytics & Insights',
      icon: 'fa-solid fa-chart-line',
      items: [
        {
          id: 'dashboard',
          label: 'Executive KPI',
          desc: 'High-level metrics & revenue',
          icon: 'fa-solid fa-chart-pie'
        },
        {
          id: 'audit',
          label: 'Audit Logs',
          desc: 'Security trail & system logs',
          icon: 'fa-solid fa-shield-halved',
          count: auditLogsCount
        }
      ]
    },
    {
      group: 'Operations & Fleet',
      icon: 'fa-solid fa-car-side',
      items: [
        {
          id: 'browse',
          label: 'Browse Fleet',
          desc: 'Customer showroom catalog',
          icon: 'fa-solid fa-car-rear',
          badgeText: 'Live'
        },
        {
          id: 'fleet',
          label: 'Fleet Inventory',
          desc: 'Vehicle specs & availability',
          icon: 'fa-solid fa-warehouse',
          count: allVehiclesCount
        },
        {
          id: 'bookings',
          label: 'Bookings',
          desc: 'Reservations & approvals',
          icon: 'fa-solid fa-calendar-days',
          count: bookingsCount
        },
        {
          id: 'rentals',
          label: 'Active Rentals',
          desc: 'Handover checkouts & returns',
          icon: 'fa-solid fa-key',
          count: rentalsCount
        },
        {
          id: 'maintenance',
          label: 'Maintenance',
          desc: 'Service logs & inspections',
          icon: 'fa-solid fa-screwdriver-wrench',
          count: maintenanceCount
        }
      ]
    },
    {
      group: 'Financial Logistics',
      icon: 'fa-solid fa-wallet',
      items: [
        {
          id: 'payments',
          label: 'Payments & Fines',
          desc: 'Billing, fines & transactions',
          icon: 'fa-solid fa-credit-card',
          count: outstandingCount
        }
      ]
    },
    {
      group: 'System & Security',
      icon: 'fa-solid fa-sliders',
      items: [
        {
          id: 'users',
          label: 'User Accounts',
          desc: 'Staff logins & permissions',
          icon: 'fa-solid fa-user-shield',
          count: usersCount
        },
        {
          id: 'customers',
          label: 'Customer Directory',
          desc: 'Client profiles & licenses',
          icon: 'fa-solid fa-users-gear',
          count: customersCount
        },
        {
          id: 'branches',
          label: 'Branches & Hubs',
          desc: 'Locations & regional fleets',
          icon: 'fa-solid fa-building'
        },
        {
          id: 'profile',
          label: 'My Profile',
          desc: 'Admin credentials & settings',
          icon: 'fa-solid fa-id-badge'
        }
      ]
    }
  ], [auditLogsCount, allVehiclesCount, bookingsCount, rentalsCount, maintenanceCount, outstandingCount, usersCount, customersCount]);

  // Filter categories based on search input
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return adminCategories;
    const q = searchQuery.toLowerCase();
    return adminCategories
      .map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.label.toLowerCase().includes(q) ||
          item.desc?.toLowerCase().includes(q)
        )
      }))
      .filter(cat => cat.items.length > 0);
  }, [adminCategories, searchQuery]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const adminName = currentUser?.FullName || currentUser?.Username || 'Admin User';
  const adminInitial = adminName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`admin-side-panel-backdrop ${isMobileOpen ? 'open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden={!isMobileOpen}
      />

      {/* Side Panel Container */}
      <aside 
        className={`admin-side-panel ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        aria-label="Admin Navigation Panel"
      >
        {/* Panel Brand Header */}
        <div className="side-panel-header">
          {!isCollapsed ? (
            <>
              <div 
                className="side-panel-brand" 
                onClick={() => handleSelectTab('dashboard')} 
                title="Go to Executive KPI Dashboard"
                style={{ cursor: 'pointer' }}
              >
                <div className="side-panel-brand-icon">
                  <i className="fa-solid fa-car-side"></i>
                </div>
                <div className="side-panel-brand-text">
                  <div className="side-panel-brand-title">
                    RENTO <span className="side-panel-pro-tag">PRO</span>
                  </div>
                  <span className="side-panel-brand-tag">Enterprise Admin</span>
                </div>
              </div>

              <button 
                className="side-panel-toggle-btn"
                onClick={onToggleCollapse}
                title="Collapse Side Panel (Ctrl+B)"
                type="button"
                aria-label="Collapse Side Panel"
              >
                <i className="fa-solid fa-angles-left"></i>
              </button>
            </>
          ) : (
            <div className="side-panel-collapsed-header">
              <button 
                className="side-panel-toggle-btn collapsed-toggle-btn"
                onClick={onToggleCollapse}
                title="Expand Side Panel (Ctrl+B)"
                type="button"
                aria-label="Expand Side Panel"
              >
                <div className="collapsed-icon-box">
                  <i className="fa-solid fa-car-side"></i>
                </div>
                <i className="fa-solid fa-angles-right expand-arrow"></i>
              </button>
            </div>
          )}
        </div>

        {/* Quick Search (Only when expanded) */}
        {!isCollapsed && (
          <div className="side-panel-search-wrap">
            <div className="side-panel-search-box">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="side-panel-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Navigation Body */}
        <div className="side-panel-nav-body">
          {filteredCategories.map((cat) => (
            <div key={cat.group} className="side-panel-group">
              {!isCollapsed && (
                <div className="side-panel-group-header">
                  <i className={cat.icon}></i>
                  <span>{cat.group}</span>
                </div>
              )}
              {isCollapsed && <div className="side-panel-group-divider" />}

              <div className="side-panel-group-items">
                {cat.items.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      className={`side-panel-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectTab(tab.id)}
                      title={isCollapsed ? `${tab.label}${tab.count ? ` (${tab.count})` : ''}` : undefined}
                      type="button"
                    >
                      <div className="nav-item-icon-wrap">
                        <i className={tab.icon}></i>
                      </div>

                      {!isCollapsed && (
                        <>
                          <div className="nav-item-content">
                            <span className="nav-item-label">{tab.label}</span>
                            <span className="nav-item-desc">{tab.desc}</span>
                          </div>

                          {tab.badgeText && (
                            <span className="nav-item-chip">{tab.badgeText}</span>
                          )}

                          {tab.count !== undefined && tab.count > 0 && (
                            <span className="nav-item-badge">{tab.count}</span>
                          )}

                          {isActive && (
                            <div className="nav-item-indicator" />
                          )}
                        </>
                      )}

                      {/* Collapsed Badge Dot Indicator */}
                      {isCollapsed && tab.count !== undefined && tab.count > 0 && (
                        <span className="collapsed-badge-dot" title={`${tab.count} items`}>
                          {tab.count > 99 ? '99+' : tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && !isCollapsed && (
            <div className="side-panel-no-results">
              <i className="fa-solid fa-magnifying-glass"></i>
              <p>No modules found</p>
              <button 
                type="button" 
                className="btn-reset-search"
                onClick={() => setSearchQuery('')}
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Panel Footer: System Status & User Profile */}
        <div className="side-panel-footer">
          {!isCollapsed && (
            <div className="side-panel-status-indicator">
              <span className="status-live-pulse" />
              <span className="status-text">Production Database • Online</span>
            </div>
          )}

          <div className="side-panel-user-capsule">
            <div 
              className="user-avatar side-panel-avatar"
              onClick={() => handleSelectTab('profile')}
              title="View Profile"
              style={{ cursor: 'pointer' }}
            >
              {adminInitial}
            </div>

            {!isCollapsed && (
              <div 
                className="side-panel-user-details"
                onClick={() => handleSelectTab('profile')}
                style={{ cursor: 'pointer' }}
                title="View Admin Profile"
              >
                <span className="user-name side-panel-user-name">{adminName}</span>
                <span className="side-panel-role-badge">
                  <i className="fa-solid fa-shield-halved" style={{ fontSize: '9px', marginRight: '4px' }}></i>
                  System Administrator
                </span>
              </div>
            )}

            <button
              className="side-panel-logout-btn"
              onClick={onLogout}
              title="Sign Out"
              type="button"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
