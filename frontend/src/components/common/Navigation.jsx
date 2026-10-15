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
    auditLogsCount = 0
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
            🚗 Browse & Rent Fleet
          </button>
          {currentUser && (
            <>
              <button 
                className={`tab-btn ${activeTab === 'my_bookings' ? 'active' : ''}`} 
                onClick={() => setActiveTab('my_bookings')}
              >
                📑 My Bookings <span className="tab-badge">{myBookingsCount}</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'my_invoices' ? 'active' : ''}`} 
                onClick={() => setActiveTab('my_invoices')}
              >
                💳 My Invoices & Fines
              </button>
            </>
          )}
          <button 
            className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`} 
            onClick={() => setActiveTab('branches')}
          >
            🏢 Branches & Locations
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
            🚗 Fleet Inventory <span className="tab-badge">{allVehiclesCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} 
            onClick={() => setActiveTab('bookings')}
          >
            📑 Bookings <span className="tab-badge">{bookingsCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rentals' ? 'active' : ''}`} 
            onClick={() => setActiveTab('rentals')}
          >
            🔑 Active Rentals <span className="tab-badge">{rentalsCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} 
            onClick={() => setActiveTab('payments')}
          >
            💳 Payments & Fines <span className="tab-badge">{outstandingCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`} 
            onClick={() => setActiveTab('maintenance')}
          >
            🛠️ Maintenance <span className="tab-badge">{maintenanceCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`} 
            onClick={() => setActiveTab('customers')}
          >
            👥 Customers <span className="tab-badge">{customersCount}</span>
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
            📊 Executive KPI
          </button>
          <button 
            className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`} 
            onClick={() => setActiveTab('fleet')}
          >
            🚗 Fleet <span className="tab-badge">{allVehiclesCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} 
            onClick={() => setActiveTab('bookings')}
          >
            📑 Bookings <span className="tab-badge">{bookingsCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rentals' ? 'active' : ''}`} 
            onClick={() => setActiveTab('rentals')}
          >
            🔑 Rentals <span className="tab-badge">{rentalsCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} 
            onClick={() => setActiveTab('payments')}
          >
            💳 Payments <span className="tab-badge">{outstandingCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`} 
            onClick={() => setActiveTab('maintenance')}
          >
            🛠️ Maintenance <span className="tab-badge">{maintenanceCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`} 
            onClick={() => setActiveTab('customers')}
          >
            👥 Customers <span className="tab-badge">{customersCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`} 
            onClick={() => setActiveTab('branches')}
          >
            🏢 Branches
          </button>
          <button 
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} 
            onClick={() => setActiveTab('audit')}
          >
            🛡️ Audit Logs <span className="tab-badge">{auditLogsCount}</span>
          </button>
        </>
      )}

      {/* Viva Special Tab (Always Visible for Evaluators) */}
      <button 
        className={`tab-btn ${activeTab === 'viva' ? 'active' : ''}`} 
        onClick={() => setActiveTab('viva')}
        style={{ 
          marginLeft: 'auto', 
          background: activeTab === 'viva' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.15)', 
          color: activeTab === 'viva' ? '#fff' : '#c084fc' 
        }}
      >
        🔬 ADBMS Viva Hub
      </button>
    </nav>
  );
}
