import React from 'react';

export default function BranchesTab({
  branches = [],
  branchPerformance = [],
  role
}) {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">🏢 Island-Wide Strategic Hubs & Branches ({branches.length} Locations)</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Seamless pickup & dropoff across Western, Central, and Southern provinces
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {branches.map((b) => (
          <div 
            key={b.BranchID} 
            className="stat-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge available">Active Hub</span>
                <i className="fa-solid fa-building" style={{ color: 'var(--yellow)', fontSize: '1.25rem', opacity: 0.8 }}></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginTop: '12px', marginBottom: '8px' }}>
                {b.BranchName}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)', fontSize: '0.88rem', marginBottom: '8px' }}>
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--yellow)', width: '16px' }}></i>
                <span>{b.Location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)', fontSize: '0.88rem' }}>
                <i className="fa-solid fa-phone" style={{ color: '#34d399', width: '16px' }}></i>
                <span>{b.ContactNumber}</span>
              </div>
            </div>
            <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span><i className="fa-regular fa-clock" style={{ marginRight: '4px' }}></i> 24/7 Dispatch Available</span>
              <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>Branch #{b.BranchID}</span>
            </div>
          </div>
        ))}
      </div>

      {role === 'Admin' && (
        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
            📈 Branch Performance Metrics (BranchPerformanceView)
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>Total Bookings</th>
                  <th>Completed Revenue</th>
                </tr>
              </thead>
              <tbody>
                {branchPerformance.map((bp, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{bp.BranchName}</td>
                    <td><strong>{bp.TotalBookings}</strong> Bookings</td>
                    <td style={{ fontWeight: 700, color: '#34d399' }}>
                      LKR {Number(bp.TotalRevenue || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
