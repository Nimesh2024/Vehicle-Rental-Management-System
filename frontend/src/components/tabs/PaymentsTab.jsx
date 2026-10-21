import React from 'react';

export default function PaymentsTab({
  isMyInvoices = false,
  outstandingPayments = [],
  fines = [],
  onSettlePayment
}) {
  return (
    <>
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">
            💳 {isMyInvoices ? 'My Invoices & Payment Due' : 'Outstanding Pending Payments (OutstandingPaymentView)'}
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Rental Status</th>
                <th>Amount Due (LKR)</th>
                <th>Invoice Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {outstandingPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No outstanding payments due.
                  </td>
                </tr>
              ) : (
                outstandingPayments.map((p) => {
                  const isReturned = p.RentalStatus === 'Completed';
                  const isOngoing = p.RentalStatus === 'Ongoing';

                  return (
                    <tr key={p.PaymentID}>
                      <td>#{p.PaymentID}</td>
                      <td>{p.FirstName} {p.LastName}</td>
                      <td>{p.Make ? `${p.Make} ${p.Model} (${p.RegistrationNumber})` : `Rental #${p.RentalID}`}</td>
                      <td>
                        {isOngoing && (
                          <span className="badge rented" style={{ fontSize: '0.75rem' }}>
                            🚗 On Road (Pending Return)
                          </span>
                        )}
                        {isReturned && (
                          <span className="badge available" style={{ fontSize: '0.75rem' }}>
                            ↩️ Returned (Ready to Settle)
                          </span>
                        )}
                        {!isOngoing && !isReturned && (
                          <span className="badge pending" style={{ fontSize: '0.75rem' }}>
                            {p.RentalStatus || 'Pending'}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#34d399' }}>
                          LKR {Number(p.Amount).toLocaleString()}
                        </div>
                        {Number(p.TotalFines) > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#f87171' }}>
                            Includes LKR {Number(p.TotalFines).toLocaleString()} in fines
                          </div>
                        )}
                      </td>
                      <td>{new Date(p.PaymentDate).toLocaleDateString()}</td>
                      <td>
                        {isReturned ? (
                          <button 
                            className="btn-success btn-sm"
                            onClick={() => onSettlePayment(p)}
                          >
                            💳 Settle Full Payment (SP)
                          </button>
                        ) : (
                          <button 
                            className="btn-sm"
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed', background: '#334155', color: '#94a3b8' }}
                            title="Payment is settled upon vehicle return once final mileage and damages are assessed."
                          >
                            ⏳ Awaiting Return
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">⚠️ Customer Fines & Damages (CustomerFineView)</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Auto-calculated via CalculateFine() UDF (in LKR)
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Fine ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Fine Amount (LKR)</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fines.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No recorded fines or damage penalties.
                  </td>
                </tr>
              ) : (
                fines.map((f) => (
                  <tr key={f.FineID}>
                    <td>#{f.FineID}</td>
                    <td>{f.FirstName} {f.LastName}</td>
                    <td>{f.RegistrationNumber}</td>
                    <td><span className="badge maintenance_required">{f.FineType}</span></td>
                    <td style={{ fontWeight: 700, color: '#f87171' }}>
                      LKR {Number(f.Amount).toLocaleString()}
                    </td>
                    <td>{f.Description}</td>
                    <td>
                      <span className={`badge ${(f.Status || 'pending').toLowerCase()}`}>
                        {f.Status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
