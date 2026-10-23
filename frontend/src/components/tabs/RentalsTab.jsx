import React from 'react';

export default function RentalsTab({
  activeRentals = [],
  role,
  currentUser,
  onReturnVehicle
}) {
  const isAuthorizedStaff = role === 'Branch Manager' || role === 'Rental Staff' || role === 'Admin';
  const isBranchScoped = (role === 'Branch Manager' || role === 'Rental Staff') && currentUser?.BranchName;

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">🔑 Active Ongoing Rentals</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isBranchScoped 
              ? `Real-time tracking of active rentals dispatched from ${currentUser.BranchName}`
              : 'Real-time tracking of dispatched vehicles currently in customer possession'}
          </div>
        </div>
      </div>

      {isBranchScoped && (
        <div className="branch-scope-banner">
          <i className="fa-solid fa-location-dot"></i>
          <span>
            Operating Branch Hub: <strong>{currentUser.BranchName}</strong> • Showing <strong>{activeRentals.length}</strong> active rentals dispatched from this hub.
          </span>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Rental ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Branch</th>
              <th>Start Date</th>
              <th>Start Mileage</th>
              <th>Rental Status</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeRentals.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                  {isBranchScoped 
                    ? `No ongoing rentals currently dispatched from ${currentUser.BranchName}.`
                    : 'No ongoing rentals found.'}
                </td>
              </tr>
            ) : (
              activeRentals.map((r) => (
                <tr key={r.RentalID}>
                  <td>#{r.RentalID}</td>
                  <td>{r.FirstName} {r.LastName} ({r.Phone})</td>
                  <td>{r.Make} {r.Model} ({r.RegistrationNumber})</td>
                  <td>
                    <span style={{ color: isBranchScoped ? 'var(--yellow)' : 'inherit', fontWeight: isBranchScoped ? 600 : 400 }}>
                      {r.BranchName || 'Colombo City Hub'}
                    </span>
                  </td>
                  <td>{new Date(r.ActualStartDate).toLocaleString()}</td>
                  <td>{r.StartMileage} km</td>
                  <td><span className="badge ongoing">{r.RentalStatus}</span></td>
                  <td>
                    <span className={`badge ${(r.PaymentStatus || 'pending').toLowerCase()}`}>
                      {r.PaymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td>
                    {isAuthorizedStaff && (
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => onReturnVehicle(r)}
                      >
                        ↩️ Process Return
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
