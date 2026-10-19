import React from 'react';

export default function RentalsTab({
  activeRentals = [],
  role,
  onReturnVehicle
}) {
  const isAuthorizedStaff = role === 'Branch Manager' || role === 'Rental Staff' || role === 'Admin';

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">🔑 Active Ongoing Rentals (ActiveRentalsView)</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Auto-synced with Vehicle Status 'Rented' via DB Trigger AfterRentalInsert
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Rental ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
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
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No ongoing rentals found.
                </td>
              </tr>
            ) : (
              activeRentals.map((r) => (
                <tr key={r.RentalID}>
                  <td>#{r.RentalID}</td>
                  <td>{r.FirstName} {r.LastName} ({r.Phone})</td>
                  <td>{r.Make} {r.Model} ({r.RegistrationNumber})</td>
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
