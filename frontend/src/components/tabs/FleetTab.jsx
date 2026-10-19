import React from 'react';

export default function FleetTab({
  allVehicles = [],
  searchTerm,
  setSearchTerm,
  role,
  onAddVehicle,
  onUpdateStatus
}) {
  const isAuthorized = role === 'Admin' || role === 'Branch Manager' || role === 'Rental Staff';

  const filteredVehicles = allVehicles.filter((v) => {
    const term = searchTerm.toLowerCase();
    return (
      (v.RegistrationNumber && v.RegistrationNumber.toLowerCase().includes(term)) ||
      (v.Make && v.Make.toLowerCase().includes(term)) ||
      (v.Model && v.Model.toLowerCase().includes(term)) ||
      (v.BranchName && v.BranchName.toLowerCase().includes(term))
    );
  });

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">🚗 Fleet Inventory & Vehicle Management</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Member 2 Module: Stored Procedures AddVehicle(), UpdateVehicleStatus(), UDF VehicleAge()
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-bar-box">
            <span>🔍</span>
            <input 
              className="search-input" 
              placeholder="Search plate, model, branch..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          {isAuthorized && (
            <button className="btn-primary" onClick={onAddVehicle}>
              + Add New Vehicle (SP)
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Reg Number</th>
              <th>Make & Model</th>
              <th>Category</th>
              <th>Branch</th>
              <th>Age (UDF)</th>
              <th>Daily Rate (LKR)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((v) => (
              <tr key={v.VehicleID}>
                <td>#{v.VehicleID}</td>
                <td style={{ fontWeight: 600 }}>{v.RegistrationNumber}</td>
                <td>{v.Make} {v.Model} ({v.Year})</td>
                <td>{v.CategoryName}</td>
                <td>{v.BranchName}</td>
                <td>{v.AgeYears} yrs</td>
                <td>LKR {Number(v.DailyRate).toLocaleString()}</td>
                <td>
                  <span className={`badge ${(v.Status || 'available').toLowerCase()}`}>
                    {v.Status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-sm btn-primary"
                    onClick={() => onUpdateStatus(v)}
                  >
                    Change Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
