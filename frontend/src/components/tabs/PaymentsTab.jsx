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
                <th>Amount (LKR)</th>
                <th>Invoice Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {outstandingPayments.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No outstanding payments due.
                  </td>
                </tr>
              ) : (
                outstandingPayments.map((p) => (
                  <tr key={p.PaymentID}>
                    <td>#{p.PaymentID}</td>
                    <td>{p.FirstName} {p.LastName}</td>
                    <td style={{ fontWeight: 700, color: '#34d399' }}>
                      LKR {Number(p.Amount).toLocaleString()}
                    </td>
                    <td>{new Date(p.PaymentDate).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-success btn-sm"
                        onClick={() => onSettlePayment(p)}
                      >
                        💵 Settle Payment (SP)
                      </button>
                    </td>
                  </tr>
                ))
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
