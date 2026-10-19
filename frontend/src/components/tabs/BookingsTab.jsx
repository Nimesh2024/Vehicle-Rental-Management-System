import React from 'react';

export default function BookingsTab({
  isMyBookings = false,
  bookings = [],
  currentUser,
  role,
  onStartRental
}) {
  const isAuthorizedStaff = role === 'Branch Manager' || role === 'Rental Staff' || role === 'Admin';

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            📑 {isMyBookings ? 'My Booking Reservations' : 'All Customer Bookings'}
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            CustomerBookingView & SP ConfirmBooking() with overlap checks
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Period</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.BookingID}>
                  <td>#{b.BookingID}</td>
                  <td>{b.FirstName ? `${b.FirstName} ${b.LastName || ''}` : currentUser?.FullName}</td>
                  <td>{b.Make} {b.Model} ({b.RegistrationNumber})</td>
                  <td>
                    {new Date(b.StartDate).toLocaleDateString()} ➔ {new Date(b.EndDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${(b.Status || 'pending').toLowerCase()}`}>
                      {b.Status}
                    </span>
                  </td>
                  <td>
                    {b.Status === 'Confirmed' && isAuthorizedStaff && (
                      <button 
                        className="btn-success btn-sm"
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
