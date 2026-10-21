import React from 'react';

/**
 * ReceiptModal — Printable Payment Receipt
 * Triggered after a successful ProcessPayment SP call.
 */
export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  /* ── Derived values ─────────────────────────────────────── */
  const rentalCharge = Number(receipt.RentalCharge) || 0;
  const fineTotal    = Number(receipt.fineTotal)    || 0;
  const discount     = Number(receipt.discount)     || 0;
  const totalAmount  = Number(receipt.TotalAmount)  || (rentalCharge + fineTotal - discount);

  const fmt = (n) =>
    `LKR ${Number(n).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  const fmtDt = (d) =>
    d
      ? new Date(d).toLocaleString('en-LK', {
          year: 'numeric', month: 'short', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
        })
      : '—';

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-LK', {
          year: 'numeric', month: 'short', day: '2-digit',
        })
      : '—';

  const statusColor = {
    Completed: '#34d399',
    Pending:   '#fbbf24',
    Refunded:  '#60a5fa',
    Failed:    '#f87171',
  }[receipt.PaymentStatus] || '#fff';

  const handlePrint = () => window.print();

  return (
    <>
      {/* Screen overlay — hidden on print via CSS */}
      <div className="modal-overlay receipt-screen-only" onClick={onClose}>
        <div
          className="modal-content receipt-modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: 660, padding: 0, overflow: 'hidden' }}
        >
          {/* ── Header bar ── */}
          <div className="receipt-header-bar">
            <div>
              <div className="receipt-logo">🚗 VehicleRental</div>
              <div className="receipt-tagline">Advanced Database Management System</div>
            </div>
            <button className="modal-close receipt-screen-only" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* ── Receipt body (id used by @print CSS) ── */}
          <div id="receipt-print-area" className="receipt-body">
            {/* Title row */}
            <div className="receipt-title-row">
              <div>
                <h2 className="receipt-title">PAYMENT RECEIPT</h2>
                <div className="receipt-number">{receipt.receiptNo}</div>
              </div>
              <span
                className="badge"
                style={{
                  background: `${statusColor}22`,
                  color: statusColor,
                  border: `1px solid ${statusColor}55`,
                  fontSize: '0.85rem',
                  padding: '0.3rem 0.85rem',
                  borderRadius: 6,
                }}
              >
                {receipt.PaymentStatus}
              </span>
            </div>

            <div className="receipt-divider" />

            {/* ── 2-column info grid ── */}
            <div className="receipt-info-grid">
              <div className="receipt-card">
                <div className="receipt-card-title">👤 Customer</div>
                <div className="receipt-card-value">
                  {receipt.FirstName} {receipt.LastName}
                </div>
                <div className="receipt-card-sub">NIC/Passport: {receipt.NIC_Passport}</div>
                <div className="receipt-card-sub">Phone: {receipt.Phone}</div>
                <div className="receipt-card-sub">{receipt.Email}</div>
              </div>

              <div className="receipt-card">
                <div className="receipt-card-title">🚗 Vehicle</div>
                <div className="receipt-card-value">
                  {receipt.Make} {receipt.Model} ({receipt.VehicleYear})
                </div>
                <div className="receipt-card-sub">
                  Reg No:{' '}
                  <strong style={{ color: '#f5c518' }}>
                    {receipt.RegistrationNumber}
                  </strong>
                </div>
                <div className="receipt-card-sub">Category: {receipt.CategoryName}</div>
                <div className="receipt-card-sub">Daily Rate: {fmt(receipt.DailyRate)}</div>
              </div>

              <div className="receipt-card">
                <div className="receipt-card-title">📅 Rental Period</div>
                <div className="receipt-card-value">
                  {fmtDate(receipt.StartDate)} → {fmtDate(receipt.EndDate)}
                </div>
                <div className="receipt-card-sub">
                  Duration: <strong>{receipt.RentalDays} day(s)</strong>
                </div>
                <div className="receipt-card-sub">Rental ID: #{receipt.RentalID}</div>
                <div className="receipt-card-sub">
                  Mileage: {receipt.StartMileage} → {receipt.EndMileage ?? '—'} km
                </div>
              </div>

              <div className="receipt-card">
                <div className="receipt-card-title">💳 Payment Info</div>
                <div className="receipt-card-value">{receipt.PaymentMethod}</div>
                <div className="receipt-card-sub">Payment ID: #{receipt.PaymentID}</div>
                <div className="receipt-card-sub">Date: {fmtDt(receipt.PaymentDate)}</div>
              </div>
            </div>

            <div className="receipt-divider" />

            {/* ── Itemised charges ── */}
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {/* Base rental charge */}
                <tr>
                  <td>
                    Rental Charge
                    <span className="receipt-sub-label">
                      &nbsp;({receipt.RentalDays} day(s) × {fmt(receipt.DailyRate)})
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>{fmt(rentalCharge)}</td>
                </tr>

                {/* Fines */}
                {receipt.fines && receipt.fines.length > 0 ? (
                  receipt.fines.map((f) => (
                    <tr key={f.FineID}>
                      <td>
                        Fine — {f.FineType}
                        {f.Description && (
                          <span className="receipt-sub-label">
                            &nbsp;({f.Description})
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', color: '#f87171' }}>
                        + {fmt(f.Amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={{ color: 'var(--text-muted)' }}>
                      Fines &amp; Penalties
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      LKR 0.00
                    </td>
                  </tr>
                )}

                {/* Discount */}
                <tr>
                  <td style={{ color: '#34d399' }}>Discount / Promo</td>
                  <td style={{ textAlign: 'right', color: '#34d399' }}>
                    − {fmt(discount)}
                  </td>
                </tr>
              </tbody>

              <tfoot>
                <tr className="receipt-total-row">
                  <td>
                    <strong>TOTAL PAYABLE</strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>{fmt(totalAmount)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Footer note */}
            <div className="receipt-footer-note">
              Thank you for choosing VehicleRental. This is an auto-generated receipt.
              &nbsp; Receipt No: <strong>{receipt.receiptNo}</strong>
            </div>
          </div>

          {/* ── Action buttons (screen only) ── */}
          <div className="receipt-action-bar receipt-screen-only">
            <button className="btn-primary" onClick={handlePrint}>
              🖨️&nbsp; Print Receipt
            </button>
            <button
              onClick={handlePrint}
              style={{
                background: 'rgba(96,165,250,0.12)',
                border: '1px solid #60a5fa55',
                color: '#60a5fa',
                borderRadius: 8,
                padding: '0.6rem 1.4rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              📄&nbsp; Download PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-muted)',
                borderRadius: 8,
                padding: '0.6rem 1.2rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

