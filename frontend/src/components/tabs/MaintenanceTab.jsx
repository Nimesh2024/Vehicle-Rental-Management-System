import React from 'react';

export default function MaintenanceTab({
  maintenance = [],
  role,
  onScheduleMaintenance,
  onUpdateStatus
}) {
  const isAuthorized = role === 'Admin' || role === 'Branch Manager' || role === 'Rental Staff';

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">🛠️ Workshop Maintenance Records (VehicleMaintenanceView)</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Trigger ChangeVehToMaintenance & ChangeVehToAvailable automation
          </div>
        </div>
        {isAuthorized && (
          <button className="btn-primary" onClick={onScheduleMaintenance}>
            + Schedule Maintenance (SP)
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Maint ID</th>
              <th>Vehicle Plate</th>
              <th>Branch</th>
              <th>Service Date</th>
              <th>Cost (LKR)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenance.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No maintenance records found.
                </td>
              </tr>
            ) : (
              maintenance.map((m) => (
                <tr key={m.MaintenanceID}>
                  <td>#{m.MaintenanceID}</td>
                  <td style={{ fontWeight: 600 }}>{m.RegistrationNumber}</td>
                  <td>{m.BranchName}</td>
                  <td>{new Date(m.ServiceDate).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600 }}>LKR {Number(m.Cost).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${(m.MaintenanceStatus || '').toLowerCase()}`}>
                      {m.MaintenanceStatus}
                    </span>
                  </td>
                  <td>
                    {isAuthorized && (
                      <button 
                        className="btn-sm btn-primary"
                        onClick={() => onUpdateStatus(m)}
                      >
                        Update Status
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
