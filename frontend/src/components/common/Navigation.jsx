import React, { useState, useEffect, useMemo } from 'react';

export default function Navigation({
  currentUser,
  activeTab,
  setActiveTab,
  counts = {}
}) {
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const role = currentUser?.RoleName;
  const {
    myBookingsCount = 0,
    allVehiclesCount = 0,
    bookingsCount = 0,
    rentalsCount = 0,
    outstandingCount = 0,
    maintenanceCount = 0,
    customersCount = 0,
    auditLogsCount = 0,
    usersCount = 0
  } = counts;

  // Handle Escape key to close the drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsAdminMenuOpen(false);
      }
    };
    if (isAdminMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminMenuOpen]);

  // Admin modules organized into intuitive categories
  const adminCategories = useMemo(() => [
    {
      title: 'Executive & Analytics',
      icon: 'fa-solid fa-chart-line',
      items: [
        {
          id: 'dashboard',
          label: 'Executive KPI',
          desc: 'High-level business metrics, revenue & trends',
          icon: 'fa-solid fa-chart-pie'
        },
        {
          id: 'audit',
          label: 'Audit Logs',
          desc: 'Security trail, changes & system action history',
          icon: 'fa-solid fa-shield-halved',
          count: auditLogsCount
        }
      ]
    },
    {
      title: 'Fleet & Operations',
      icon: 'fa-solid fa-car-side',
      items: [
        {
          id: 'browse',
          label: 'Browse Fleet',
          desc: 'Public vehicle catalog & rental showroom view',
          icon: 'fa-solid fa-car-rear'
        },
        {
          id: 'fleet',
          label: 'Fleet Inventory',
          desc: 'Vehicle specifications, registration & status',
          icon: 'fa-solid fa-warehouse',
          count: allVehiclesCount
        },
        {
          id: 'bookings',
          label: 'Bookings',
          desc: 'Customer reservations, approvals & dispatching',
          icon: 'fa-solid fa-calendar-days',
          count: bookingsCount
        },
        {
          id: 'rentals',
          label: 'Active Rentals',
          desc: 'Handover check-outs, live rentals & check-in returns',
          icon: 'fa-solid fa-key',
          count: rentalsCount
        },
        {
          id: 'maintenance',
          label: 'Maintenance',
          desc: 'Service logs, vehicle repairs & scheduled inspections',
          icon: 'fa-solid fa-screwdriver-wrench',
          count: maintenanceCount
        }
      ]
    },
    {
      title: 'Finance & Payments',
      icon: 'fa-solid fa-wallet',
      items: [
        {
          id: 'payments',
          label: 'Payments & Fines',
          desc: 'Rental billing, overdue penalties & fine receipts',
          icon: 'fa-solid fa-credit-card',
          count: outstandingCount
        }
      ]
    },
    {
      title: 'Administration & System',
      icon: 'fa-solid fa-sliders',
      items: [
        {
          id: 'users',
          label: 'User Accounts',
          desc: 'Staff credentials, roles & system security',
          icon: 'fa-solid fa-user-shield',
          count: usersCount
        },
        {
          id: 'customers',
          label: 'Customer Directory',
          desc: 'Customer profiles, driver licenses & verification',
          icon: 'fa-solid fa-users-gear',
          count: customersCount
        },
        {
          id: 'branches',
          label: 'Branches & Hubs',
          desc: 'Rental hub locations, managers & facility fleets',
          icon: 'fa-solid fa-building'
        },
        {
          id: 'profile',
          label: 'My Profile',
          desc: 'Administrator settings, personal credentials & security',
          icon: 'fa-solid fa-id-badge'
        }
      ]
    }
  ], [auditLogsCount, allVehiclesCount, bookingsCount, rentalsCount, maintenanceCount, outstandingCount, usersCount, customersCount]);

  // Flattened list for quick lookup
  const allAdminTabs = useMemo(() => {
    return adminCategories.flatMap(cat => cat.items);
  }, [adminCategories]);

  // Current active tab object
  const activeTabInfo = allAdminTabs.find(t => t.id === activeTab) || {
    id: activeTab,
    label: activeTab === 'browse' ? 'Browse Fleet' : activeTab,
    icon: 'fa-solid fa-chart-pie'
  };

  // Search filtered categories for the drawer
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

  return (
    <>
      <nav className={`tabs-nav ${role === 'Admin' ? 'tabs-nav-admin' : ''}`}>
        {/* Guest or Customer Tabs */}
        {(!currentUser || role === 'Customer') && (
          <>
            <button 
              className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`} 
              onClick={() => setActiveTab('browse')}
            >
              <i className="fa-solid fa-car-rear"></i> Browse Fleet
            </button>
            {currentUser && (
              <>
                <button 
                  className={`tab-btn ${activeTab === 'my_bookings' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('my_bookings')}
                >
                  <i className="fa-solid fa-calendar-check"></i> My Bookings <span className="tab-badge">{myBookingsCount}</span>
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'my_invoices' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('my_invoices')}
                >
                  <i className="fa-solid fa-file-invoice-dollar"></i> Invoices & Fines
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fa-solid fa-id-badge"></i> My Profile
                </button>
              </>
            )}
            <button 
              className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`} 
              onClick={() => setActiveTab('branches')}
            >
              <i className="fa-solid fa-location-dot"></i> Branches & Hubs
            </button>
          </>
        )}

        {/* Staff / Manager Tabs */}
        {(role === 'Branch Manager' || role === 'Rental Staff') && (
          <>
            <button 
              className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`} 
              onClick={() => setActiveTab('browse')}
            >
              <i className="fa-solid fa-car-rear"></i> Browse Fleet
            </button>
            <button 
              className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`} 
              onClick={() => setActiveTab('fleet')}
            >
              <i className="fa-solid fa-warehouse"></i> Fleet Inventory <span className="tab-badge">{allVehiclesCount}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} 
              onClick={() => setActiveTab('bookings')}
            >
              <i className="fa-solid fa-calendar-days"></i> Bookings <span className="tab-badge">{bookingsCount}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'rentals' ? 'active' : ''}`} 
              onClick={() => setActiveTab('rentals')}
            >
              <i className="fa-solid fa-key"></i> Active Rentals <span className="tab-badge">{rentalsCount}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} 
              onClick={() => setActiveTab('payments')}
            >
              <i className="fa-solid fa-credit-card"></i> Payments & Fines <span className="tab-badge">{outstandingCount}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`} 
              onClick={() => setActiveTab('maintenance')}
            >
              <i className="fa-solid fa-screwdriver-wrench"></i> Maintenance <span className="tab-badge">{maintenanceCount}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`} 
              onClick={() => setActiveTab('customers')}
            >
              <i className="fa-solid fa-users"></i> Customers <span className="tab-badge">{customersCount}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} 
              onClick={() => setActiveTab('profile')}
            >
              <i className="fa-solid fa-id-badge"></i> My Profile
            </button>
          </>
        )}

        {/* Admin Section: Hamburger Menu & Active Indicator */}
        {role === 'Admin' && (
          <div className="admin-nav-bar-wrapper">
            {/* Hamburger Toggle Button */}
            <button 
              className={`admin-hamburger-btn ${isAdminMenuOpen ? 'open' : ''}`}
              onClick={() => setIsAdminMenuOpen(true)}
              title="Open Admin Navigation Menu"
              id="admin-hamburger-btn"
              type="button"
            >
              <div className="hamburger-bars-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="admin-btn-text">Admin Menu</span>
              <span className="admin-badge-pill">
                <i className="fa-solid fa-layer-group"></i> 12 Tabs
              </span>
            </button>

            <div className="admin-nav-divider"></div>

            {/* Current Active Tab Indicator (clickable to open menu) */}
            <div className="admin-current-active-box">
              <span className="admin-current-label">Current:</span>
              <button 
                className="tab-btn active admin-current-btn"
                onClick={() => setIsAdminMenuOpen(true)}
                title="Click to switch admin module"
                type="button"
              >
                <i className={activeTabInfo.icon}></i>
                <span>{activeTabInfo.label}</span>
                {activeTabInfo.count !== undefined && activeTabInfo.count > 0 && (
                  <span className="tab-badge">{activeTabInfo.count}</span>
                )}
                <i className="fa-solid fa-chevron-down current-chevron"></i>
              </button>
            </div>

            {/* Quick Direct Shortcuts for common navigation */}
            <div className="admin-quick-shortcuts">
              {activeTab !== 'browse' && (
                <button 
                  className="tab-btn admin-quick-btn"
                  onClick={() => setActiveTab('browse')}
                  title="Switch to Public Fleet Catalog"
                  type="button"
                >
                  <i className="fa-solid fa-car-rear"></i> Browse Fleet
                </button>
              )}
              {activeTab !== 'dashboard' && (
                <button 
                  className="tab-btn admin-quick-btn"
                  onClick={() => setActiveTab('dashboard')}
                  title="Switch to Executive KPI Dashboard"
                  type="button"
                >
                  <i className="fa-solid fa-chart-pie"></i> Executive KPI
                </button>
              )}
              {activeTab !== 'fleet' && (
                <button 
                  className="tab-btn admin-quick-btn"
                  onClick={() => setActiveTab('fleet')}
                  title="Switch to Fleet Inventory"
                  type="button"
                >
                  <i className="fa-solid fa-warehouse"></i> Fleet <span className="tab-badge">{allVehiclesCount}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Admin Slide-out Drawer & Overlay */}
      {role === 'Admin' && (
        <>
          <div 
            className={`admin-drawer-overlay ${isAdminMenuOpen ? 'open' : ''}`}
            onClick={() => setIsAdminMenuOpen(false)}
            aria-hidden={!isAdminMenuOpen}
          />
          <aside 
            className={`admin-drawer ${isAdminMenuOpen ? 'open' : ''}`}
            aria-label="Admin Navigation Drawer"
          >
            {/* Drawer Header */}
            <div className="admin-drawer-header">
              <div className="admin-drawer-brand">
                <div className="admin-drawer-logo">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div className="admin-drawer-headings">
                  <h3 className="admin-drawer-title">Admin Modules</h3>
                  <span className="admin-drawer-subtitle">AutoManager Pro Management Hub</span>
                </div>
              </div>
              <button 
                className="admin-drawer-close-btn"
                onClick={() => setIsAdminMenuOpen(false)}
                title="Close Menu (Esc)"
                type="button"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Drawer Search / Filter */}
            <div className="admin-drawer-search-box">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input 
                type="text"
                className="admin-drawer-search-input"
                placeholder="Filter modules (e.g. fleet, user, payment)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear filter"
                  type="button"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>

            {/* Drawer Scrollable Content */}
            <div className="admin-drawer-body">
              {filteredCategories.map((cat) => (
                <div key={cat.title} className="admin-drawer-group">
                  <div className="admin-drawer-group-header">
                    <i className={cat.icon}></i>
                    <span>{cat.title}</span>
                  </div>
                  <div className="admin-drawer-group-items">
                    {cat.items.map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          className={`admin-drawer-item ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsAdminMenuOpen(false);
                            setSearchQuery('');
                          }}
                          type="button"
                        >
                          <div className="admin-drawer-item-icon">
                            <i className={tab.icon}></i>
                          </div>
                          <div className="admin-drawer-item-text">
                            <div className="admin-drawer-item-name">{tab.label}</div>
                            <div className="admin-drawer-item-desc">{tab.desc}</div>
                          </div>
                          {tab.count !== undefined && tab.count > 0 && (
                            <span className="admin-drawer-item-badge">{tab.count}</span>
                          )}
                          {isActive && (
                            <span className="admin-drawer-active-check">
                              <i className="fa-solid fa-check"></i>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredCategories.length === 0 && (
                <div className="admin-drawer-empty">
                  <i className="fa-solid fa-folder-open"></i>
                  <p>No modules match "{searchQuery}"</p>
                  <button 
                    className="btn-empty-clear" 
                    onClick={() => setSearchQuery('')}
                    type="button"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="admin-drawer-footer">
              <div className="admin-drawer-user-info">
                <div className="admin-drawer-user-avatar">
                  {currentUser?.FullName ? currentUser.FullName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="admin-drawer-user-details">
                  <span className="admin-drawer-user-name">{currentUser?.FullName || currentUser?.Username || 'Admin'}</span>
                  <span className="admin-drawer-user-role">
                    <i className="fa-solid fa-crown" style={{ color: 'var(--yellow)', marginRight: '4px' }}></i>
                    System Administrator
                  </span>
                </div>
              </div>
              <div className="admin-drawer-esc-hint">
                <kbd>ESC</kbd> to close
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}