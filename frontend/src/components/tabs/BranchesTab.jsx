import React from 'react';

export default function BranchesTab({
  branches = [],
  branchPerformance = [],
  role
}) {
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">🏢 Island-Wide Strategic Branches ({branches.length} Hubs)</h2>
      </div>

      <div className="fleet-grid">
        {branches.map((b) => (
          <div key={b.BranchID} className="vehicle-card" style={{ background: 'rgba(30, 41, 59, 0.7)' }}>
            <div>
              <div className="vehicle-title">{b.BranchName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                📍 {b.Location}
              </div>
              <div style={{ color: '#60a5fa', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                📞 {b.ContactNumber}
              </div>
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
