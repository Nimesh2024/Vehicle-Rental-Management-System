import React from 'react';

export default function Navigation({
  currentUser,
  activeTab,
  setActiveTab,
  counts = {}
}) {
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

  return (
    <nav className="tabs-nav">
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
        </>
      )}

      {/* Admin Tabs */}
      {role === 'Admin' && (
        <>
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fa-solid fa-chart-pie"></i> Executive KPI
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} 
            onClick={() => setActiveTab('users')}
          >
            <i className="fa-solid fa-user-shield"></i> User Accounts <span className="tab-badge">{usersCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`} 
            onClick={() => setActiveTab('fleet')}
          >
            <i className="fa-solid fa-warehouse"></i> Fleet <span className="tab-badge">{allVehiclesCount}</span>
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
            <i className="fa-solid fa-key"></i> Rentals <span className="tab-badge">{rentalsCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} 
            onClick={() => setActiveTab('payments')}
          >
            <i className="fa-solid fa-credit-card"></i> Payments <span className="tab-badge">{outstandingCount}</span>
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
            <i className="fa-solid fa-users-gear"></i> Customers <span className="tab-badge">{customersCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`} 
            onClick={() => setActiveTab('branches')}
          >
            <i className="fa-solid fa-building"></i> Branches
          </button>
          <button 
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} 
            onClick={() => setActiveTab('audit')}
          >
            <i className="fa-solid fa-shield-halved"></i> Audit Logs <span className="tab-badge">{auditLogsCount}</span>
          </button>
        </>
      )}

      {/* Viva Special Tab (Always Visible for Evaluators) */}
      <button 
        className={`tab-btn ${activeTab === 'viva' ? 'active' : ''}`} 
        onClick={() => setActiveTab('viva')}
        style={{ 
          marginLeft: 'auto', 
          background: activeTab === 'viva' ? 'var(--yellow)' : 'rgba(245, 197, 24, 0.12)', 
          color: activeTab === 'viva' ? '#000' : 'var(--yellow)',
          border: '1px solid var(--border-gold)'
        }}
      >
        <i className="fa-solid fa-flask-vial"></i> ADBMS Viva Hub
      </button>
    </nav>
  );
}
