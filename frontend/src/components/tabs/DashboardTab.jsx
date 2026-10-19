import React from 'react';

export default function DashboardTab({ stats = {}, allVehicles = [], onNavigate }) {
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate('customers')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-title">Active Customers</div>
            <i className="fa-solid fa-users" style={{ color: 'var(--yellow)', opacity: 0.7 }}></i>
          </div>
          <div className="stat-value">{stats.customers}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <i className="fa-solid fa-database" style={{ marginRight: '4px', fontSize: '10px' }}></i> ActiveCustomerView (M1)
          </div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('fleet')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-title">Available Vehicles</div>
            <i className="fa-solid fa-car" style={{ color: 'var(--yellow)', opacity: 0.7 }}></i>
          </div>
          <div className="stat-value">{stats.vehicles}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <i className="fa-solid fa-database" style={{ marginRight: '4px', fontSize: '10px' }}></i> AvailableVehiclesView (M2)
          </div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('rentals')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-title">Active Ongoing Rentals</div>
            <i className="fa-solid fa-key" style={{ color: 'var(--yellow)', opacity: 0.7 }}></i>
          </div>
          <div className="stat-value">{stats.rentals}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <i className="fa-solid fa-database" style={{ marginRight: '4px', fontSize: '10px' }}></i> ActiveRentalsView (M3)
          </div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('maintenance')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-title">In Maintenance</div>
            <i className="fa-solid fa-wrench" style={{ color: 'var(--yellow)', opacity: 0.7 }}></i>
          </div>
          <div className="stat-value">{stats.maintenance}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <i className="fa-solid fa-database" style={{ marginRight: '4px', fontSize: '10px' }}></i> VehicleMaintenanceView (M5)
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div 
          className="stat-card" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(52, 211, 153, 0.1))',
            border: '1px solid rgba(52, 211, 153, 0.3)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-title" style={{ color: '#34d399' }}>Total Settled Revenue (LKR)</div>
            <i className="fa-solid fa-sack-dollar" style={{ color: '#34d399', fontSize: '1.25rem' }}></i>
          </div>
          <div className="stat-value" style={{ color: '#34d399', marginTop: '6px' }}>
            LKR {Number(stats.totalRevenue || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Aggregated across completed transactions via PaymentSummaryView
          </div>
        </div>
        <div 
          className="stat-card" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(245, 197, 24, 0.1))',
            border: '1px solid var(--border-gold)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-title">Total Fleet Inventory</div>
            <i className="fa-solid fa-warehouse" style={{ color: 'var(--yellow)', fontSize: '1.25rem' }}></i>
          </div>
          <div className="stat-value" style={{ color: 'var(--yellow)', marginTop: '6px' }}>
            {allVehicles.length} Vehicles
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Across 4 strategic branches in Sri Lanka (Colombo, Kandy, Galle, Negombo)
          </div>
        </div>
      </div>
    </>
  );
}
