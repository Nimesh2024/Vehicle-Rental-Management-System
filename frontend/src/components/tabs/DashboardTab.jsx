import React from 'react';

export default function DashboardTab({ stats = {}, allVehicles = [], onNavigate }) {
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate('customers')}>
          <div className="stat-title">Active Customers</div>
          <div className="stat-value">{stats.customers}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            ActiveCustomerView (M1)
          </div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('fleet')}>
          <div className="stat-title">Available Vehicles</div>
          <div className="stat-value">{stats.vehicles}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            AvailableVehiclesView (M2)
          </div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('rentals')}>
          <div className="stat-title">Active Ongoing Rentals</div>
          <div className="stat-value">{stats.rentals}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            ActiveRentalsView (M3)
          </div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('maintenance')}>
          <div className="stat-title">In Maintenance</div>
          <div className="stat-value">{stats.maintenance}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            VehicleMaintenanceView (M5)
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div 
          className="stat-card" 
          style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(16, 185, 129, 0.15))' }}
        >
          <div className="stat-title">Total Settled Revenue (LKR)</div>
          <div className="stat-value" style={{ color: '#34d399' }}>
            LKR {Number(stats.totalRevenue || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Aggregated across completed transactions via PaymentSummaryView
          </div>
        </div>
        <div 
          className="stat-card" 
          style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(59, 130, 246, 0.15))' }}
        >
          <div className="stat-title">Total Fleet Inventory</div>
          <div className="stat-value" style={{ color: '#60a5fa' }}>
            {allVehicles.length} Vehicles
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Across 4 strategic branches in Sri Lanka
          </div>
        </div>
      </div>
    </>
  );
}
