import React from 'react';

/**
 * ReceiptModal — Printable Payment Receipt
 * Triggered after settling payment or clicking "Receipt" button.
 */
export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  /* ── Derived values ─────────────────────────────────────── */
  const rentalCharge = Number(receipt.RentalCharge) || 0;
  const fineTotal    = Number(receipt.fineTotal)    || Number(receipt.TotalFines) || 0;
  const discount     = Number(receipt.discount)     || 0;
  const totalAmount  = Number(receipt.TotalAmount)  || Number(receipt.Amount) || (rentalCharge + fineTotal - discount);

  const fmt = (n) => {
    const num = Number(n);
    if (isNaN(num)) return 'LKR 0.00';
    return `LKR ${num.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
  }[receipt.PaymentStatus] || '#34d399';

  /**
   * High-reliability iframe printing method:
   * Isolates the receipt into a dedicated document so the background app dashboard
   * does not create blank pages or push the receipt off-screen.
   */
  const handlePrint = () => {
    const printArea = document.getElementById('receipt-print-area');
    if (!printArea) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.id = 'receipt-print-iframe';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receipt_${receipt.receiptNo || ('REC-' + receipt.PaymentID)}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              padding: 0;
              font-size: 13px;
              line-height: 1.5;
            }
            .receipt-top-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 18px;
            }
            .receipt-brand {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .receipt-tagline {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-top: 2px;
            }
            .receipt-title-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 16px;
            }
            .receipt-title {
              font-size: 19px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
            }
            .receipt-number {
              font-size: 14px;
              font-weight: 700;
              color: #854d0e;
              margin-top: 3px;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-weight: 700;
              font-size: 11px;
              text-transform: uppercase;
              border: 1px solid #16a34a;
              background: #f0fdf4;
              color: #16a34a;
            }
            .receipt-divider {
              height: 1px;
              background: #e2e8f0;
              margin: 14px 0;
            }
            .receipt-info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 16px;
            }
            .receipt-card {
              border: 1px solid #cbd5e1;
              background: #f8fafc;
              border-radius: 6px;
              padding: 10px 14px;
            }
            .receipt-card-title {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #64748b;
              margin-bottom: 4px;
              letter-spacing: 0.5px;
            }
            .receipt-card-value {
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 2px;
            }
            .receipt-card-sub {
              font-size: 12px;
              color: #475569;
              margin-top: 1px;
            }
            .receipt-table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
            }
            .receipt-table th {
              background: #f1f5f9;
              color: #334155;
              font-weight: 700;
              font-size: 11px;
              text-transform: uppercase;
              padding: 9px 12px;
              border-bottom: 2px solid #cbd5e1;
              text-align: left;
            }
            .receipt-table td {
              padding: 9px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
              color: #1e293b;
            }
            .receipt-sub-label {
              font-size: 11px;
              color: #64748b;
            }
            .receipt-total-row td {
              border-top: 2px solid #0f172a;
              border-bottom: 2px solid #0f172a;
              background: #fefce8;
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              padding: 11px 12px;
            }
            .receipt-footer-note {
              text-align: center;
              font-size: 11px;
              color: #64748b;
              margin-top: 20px;
              padding-top: 12px;
              border-top: 1px dashed #cbd5e1;
            }
          </style>
        </head>
        <body>
          <div class="receipt-top-header">
            <div>
              <div class="receipt-brand">🚗 RENTO AutoManager Pro</div>
              <div class="receipt-tagline">Sri Lanka Vehicle Rentals • Official Payment Tax Invoice</div>
            </div>
          </div>
          ${printArea.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 250);
  };

  return (
    <>
      {/* Screen modal overlay */}
      <div className="modal-overlay receipt-modal-overlay" onClick={onClose}>
        <div
          className="modal-content receipt-modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: 660, padding: 0, overflow: 'hidden' }}
        >
          {/* ── Header bar ── */}
          <div className="receipt-header-bar">
            <div>
              <div className="receipt-logo">🚗 RENTO AutoManager Pro</div>
              <div className="receipt-tagline">Official Payment Receipt & Tax Invoice</div>
            </div>
            <button className="modal-close receipt-screen-only" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* ── Receipt body (id used by printing) ── */}
          <div id="receipt-print-area" className="receipt-body">
            {/* Title row */}
            <div className="receipt-title-row">
              <div>
                <h2 className="receipt-title">PAYMENT RECEIPT</h2>
                <div className="receipt-number">{receipt.receiptNo || ('#REC-' + receipt.PaymentID)}</div>
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
                {receipt.PaymentStatus || 'Completed'}
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
                <div className="receipt-card-sub">NIC/Passport: {receipt.NIC_Passport || '—'}</div>
                <div className="receipt-card-sub">Phone: {receipt.Phone || '—'}</div>
                <div className="receipt-card-sub">{receipt.Email || '—'}</div>
              </div>

              <div className="receipt-card">
                <div className="receipt-card-title">🚗 Vehicle</div>
                <div className="receipt-card-value">
                  {receipt.Make} {receipt.Model} {receipt.VehicleYear ? `(${receipt.VehicleYear})` : ''}
                </div>
                <div className="receipt-card-sub">
                  Reg No:{' '}
                  <strong style={{ color: '#f5c518' }}>
                    {receipt.RegistrationNumber || '—'}
                  </strong>
                </div>
                <div className="receipt-card-sub">Category: {receipt.CategoryName || 'Standard'}</div>
                <div className="receipt-card-sub">Daily Rate: {fmt(receipt.DailyRate)}</div>
              </div>

              <div className="receipt-card">
                <div className="receipt-card-title">📅 Rental Period</div>
                <div className="receipt-card-value">
                  {fmtDate(receipt.StartDate)} → {fmtDate(receipt.EndDate)}
                </div>
                <div className="receipt-card-sub">
                  Duration: <strong>{receipt.RentalDays || 1} day(s)</strong>
                </div>
                <div className="receipt-card-sub">Rental ID: #{receipt.RentalID}</div>
                <div className="receipt-card-sub">
                  Mileage: {receipt.StartMileage ?? '—'} → {receipt.EndMileage ?? '—'} km
                </div>
              </div>

              <div className="receipt-card">
                <div className="receipt-card-title">💳 Payment Info</div>
                <div className="receipt-card-value">{receipt.PaymentMethod || 'Credit Card'}</div>
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
                    {receipt.RentalDays && (
                      <span className="receipt-sub-label">
                        &nbsp;({receipt.RentalDays} day(s) × {fmt(receipt.DailyRate)})
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>{fmt(rentalCharge > 0 ? rentalCharge : totalAmount - fineTotal)}</td>
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
                ) : fineTotal > 0 ? (
                  <tr>
                    <td>Fines &amp; Incident Charges</td>
                    <td style={{ textAlign: 'right', color: '#f87171' }}>
                      + {fmt(fineTotal)}
                    </td>
                  </tr>
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
                    <strong>TOTAL PAID</strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>{fmt(totalAmount)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Footer note */}
            <div className="receipt-footer-note">
              Thank you for choosing RENTO Vehicle Rental Management System. This is an auto-generated official tax receipt.
              &nbsp; Receipt No: <strong>{receipt.receiptNo || ('#REC-' + receipt.PaymentID)}</strong>
            </div>
          </div>

          {/* ── Action buttons (screen only) ── */}
          <div className="receipt-action-bar receipt-screen-only">
            <button className="btn-primary" onClick={handlePrint}>
              🖨️&nbsp; Print / Save as PDF
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
