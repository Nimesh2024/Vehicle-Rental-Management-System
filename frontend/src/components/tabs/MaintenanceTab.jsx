import React from 'react';

export default function MaintenanceTab({
  maintenance = [],
  role,
  currentUser,
  onScheduleMaintenance,
  onUpdateStatus
}) {
  const isAuthorized = role === 'Admin' || role === 'Branch Manager' || role === 'Rental Staff';
  const isBranchScoped = (role === 'Branch Manager' || role === 'Rental Staff') && currentUser?.BranchName;

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">🛠️ Fleet Maintenance & Servicing Records</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isBranchScoped 
              ? `Workshop repair schedule and routine servicing logs for ${currentUser.BranchName}`
              : 'Scheduled servicing, mechanical repairs, and routine safety inspections'}
          </div>
        </div>
        {isAuthorized && (
          <button className="btn-primary" onClick={onScheduleMaintenance}>
            + Schedule Maintenance
          </button>
        )}
      </div>

      {isBranchScoped && (
        <div className="branch-scope-banner">
          <i className="fa-solid fa-location-dot"></i>
          <span>
            Operating Branch Workshop: <strong>{currentUser.BranchName}</strong> • Showing <strong>{maintenance.length}</strong> service records logged for this hub.
          </span>
        </div>
      )}

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
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                  {isBranchScoped 
                    ? `No maintenance records found for ${currentUser.BranchName}. Click + Schedule Maintenance above to book servicing.`
                    : 'No maintenance records found.'}
                </td>
              </tr>
            ) : (
              maintenance.map((m) => (
                <tr key={m.MaintenanceID}>
                  <td>#{m.MaintenanceID}</td>
                  <td style={{ fontWeight: 600 }}>{m.RegistrationNumber}</td>
                  <td>
                    <span style={{ color: isBranchScoped ? 'var(--yellow)' : 'inherit', fontWeight: isBranchScoped ? 600 : 400 }}>
                      {m.BranchName}
                    </span>
                  </td>
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
