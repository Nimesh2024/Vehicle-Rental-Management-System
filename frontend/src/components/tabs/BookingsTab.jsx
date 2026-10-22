import React from 'react';

export default function BookingsTab({
  isMyBookings = false,
  bookings = [],
  currentUser,
  role,
  onStartRental
}) {
  const isAuthorizedStaff = role === 'Branch Manager' || role === 'Rental Staff' || role === 'Admin';
  const isBranchScoped = !isMyBookings && (role === 'Branch Manager' || role === 'Rental Staff') && currentUser?.BranchName;

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            📑 {isMyBookings 
              ? 'My Booking Reservations' 
              : isBranchScoped 
                ? 'Branch Customer Bookings' 
                : 'All Customer Bookings'}
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isBranchScoped 
              ? `Customer reservations and fleet dispatch schedule for ${currentUser.BranchName}`
              : 'Verified reservation schedule and automatic fleet availability validation'}
          </div>
        </div>
      </div>

      {isBranchScoped && (
        <div className="branch-scope-banner">
          <i className="fa-solid fa-location-dot"></i>
          <span>
            Operating Branch Hub: <strong>{currentUser.BranchName}</strong> • Showing <strong>{bookings.length}</strong> bookings scheduled for this location.
          </span>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Branch</th>
              <th>Period</th>
              <th>Deposit Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                  {isBranchScoped 
                    ? `No active bookings found for ${currentUser.BranchName}.` 
                    : 'No bookings found.'}
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.BookingID}>
                  <td>#{b.BookingID}</td>
                  <td>{b.FirstName ? `${b.FirstName} ${b.LastName || ''}` : currentUser?.FullName}</td>
                  <td>{b.Make} {b.Model} ({b.RegistrationNumber})</td>
                  <td>
                    <span style={{ color: isBranchScoped ? 'var(--yellow)' : 'inherit', fontWeight: isBranchScoped ? 600 : 400 }}>
                      {b.BranchName || 'Colombo City Hub'}
                    </span>
                  </td>
                  <td>
                    {new Date(b.StartDate).toLocaleDateString()} ➔ {new Date(b.EndDate).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.85rem' }}>
                        LKR {Number(b.DepositAmount || 25000).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        💳 {b.DepositPaymentMethod || 'Card'} • <span style={{ color: '#34d399', fontWeight: 600 }}>{b.DepositStatus || 'Paid'}</span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${(b.Status || 'pending').toLowerCase()}`}>
                      {b.Status}
                    </span>
                  </td>
                  <td>
                    {b.Status === 'Confirmed' && isAuthorizedStaff && (
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => onStartRental(b)}
                      >
                        🔑 Start Rental (Dispatch)
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
