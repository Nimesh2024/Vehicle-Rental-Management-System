import React from 'react';

export default function PaymentsTab({
  isMyInvoices = false,
  outstandingPayments = [],
  allPayments = [],
  fines = [],
  currentUser = null,
  onSettlePayment,
  onViewReceipt
}) {
  const isCustomerScope = isMyInvoices || currentUser?.RoleName === 'Customer';
  const isManagerScope = !isCustomerScope && (currentUser?.RoleName === 'Branch Manager' || currentUser?.RoleName === 'Rental Staff') && currentUser?.BranchName;
  const myCustomerId = currentUser?.CustomerID;
  const myUserId = currentUser?.UserID;
  const myFullName = (currentUser?.FullName || `${currentUser?.FirstName || ''} ${currentUser?.LastName || ''}`).trim().toLowerCase();
  const managerBranchId = currentUser?.BranchID != null ? Number(currentUser.BranchID) : null;
  const managerBranchName = currentUser?.BranchName || '';

  const isMyRecord = React.useCallback((item) => {
    if (!isCustomerScope) return true;

    // Check CustomerID match (numeric or string)
    if (myCustomerId && item.CustomerID && Number(item.CustomerID) === Number(myCustomerId)) {
      return true;
    }
    // Check UserID match if present
    if (myUserId && item.UserID && Number(item.UserID) === Number(myUserId)) {
      return true;
    }
    // Check Customer Name match
    if (item.FirstName || item.LastName) {
      const itemName = `${item.FirstName || ''} ${item.LastName || ''}`.trim().toLowerCase();
      if (myFullName && (itemName === myFullName || itemName.includes(myFullName) || myFullName.includes(itemName))) {
        return true;
      }
    }
    return false;
  }, [isCustomerScope, myCustomerId, myUserId, myFullName]);

  const isManagerRecord = React.useCallback((item) => {
    if (!isManagerScope) return true;
    if (item.BranchID != null && Number(item.BranchID) === managerBranchId) return true;
    if (managerBranchName && item.BranchName === managerBranchName) return true;
    return false;
  }, [isManagerScope, managerBranchId, managerBranchName]);

  const visibleOutstanding = React.useMemo(() => {
    let list = outstandingPayments;
    if (isCustomerScope) list = list.filter(isMyRecord);
    if (isManagerScope) list = list.filter(isManagerRecord);
    return list;
  }, [isCustomerScope, isManagerScope, outstandingPayments, isMyRecord, isManagerRecord]);

  const visibleFines = React.useMemo(() => {
    let list = fines;
    if (isCustomerScope) list = list.filter(isMyRecord);
    if (isManagerScope) list = list.filter(isManagerRecord);
    return list;
  }, [isCustomerScope, isManagerScope, fines, isMyRecord, isManagerRecord]);

  const visibleAllPayments = React.useMemo(() => {
    let list = allPayments;
    if (isCustomerScope) list = list.filter(isMyRecord);
    if (isManagerScope) list = list.filter(isManagerRecord);
    return list;
  }, [isCustomerScope, isManagerScope, allPayments, isMyRecord, isManagerRecord]);

  return (
    <>
      {isManagerScope && (
        <div className="branch-scope-banner" style={{ marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-location-dot"></i>
          <span>
            Operating Branch Finance Desk: <strong>{currentUser.BranchName}</strong> • Showing invoices, damage fines, and receipts scoped to this location.
          </span>
        </div>
      )}

      {/* 1. Pending / Outstanding Invoices */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              💳 {isMyInvoices ? 'My Invoices & Payment Due' : 'Outstanding Pending Payments'}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {isMyInvoices 
                ? 'Your pending rental fees and settlements awaiting vehicle return or payment' 
                : isManagerScope
                  ? `Pending rental balances and receivables awaiting customer settlement at ${currentUser.BranchName}`
                  : 'Pending rental balances and receivables awaiting customer settlement'}
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Branch</th>
                <th>Rental Status</th>
                <th>Amount Due (LKR)</th>
                <th>Invoice Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleOutstanding.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                    {isMyInvoices 
                      ? 'No outstanding payments due for your account. All clear!' 
                      : isManagerScope
                        ? `No outstanding payments due for ${currentUser.BranchName}. All invoices clear!`
                        : 'No outstanding payments due.'}
                  </td>
                </tr>
              ) : (
                visibleOutstanding.map((p) => {
                  const isReturned = p.RentalStatus === 'Completed';
                  const isOngoing = p.RentalStatus === 'Ongoing';

                  return (
                    <tr key={p.PaymentID}>
                      <td>#{p.PaymentID}</td>
                      <td>{p.FirstName} {p.LastName}</td>
                      <td>{p.Make ? `${p.Make} ${p.Model} (${p.RegistrationNumber})` : `Rental #${p.RentalID}`}</td>
                      <td>
                        <span style={{ color: isManagerScope ? 'var(--yellow)' : 'inherit', fontWeight: isManagerScope ? 600 : 400 }}>
                          {p.BranchName || 'Colombo City Hub'}
                        </span>
                      </td>
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
                            className="btn-primary btn-sm"
                            onClick={() => onSettlePayment(p)}
                          >
                            💳 Settle Full Payment (SP)
                          </button>
                        ) : (
                          <button 
                            className="btn-secondary btn-sm"
                            disabled
                            style={{ opacity: 0.5, cursor: 'not-allowed' }}
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

      {/* 2. Customer Fines & Incident Charges */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              ⚠️ {isMyInvoices ? 'My Fines & Incident Charges' : 'Customer Fines & Incident Charges'}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {isMyInvoices 
                ? 'Late returns, traffic violation penalties, and damage fee assessments for your rentals (in LKR)' 
                : 'Late returns, traffic violation penalties, and damage fee assessments (in LKR)'}
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Fine ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Branch</th>
                <th>Type</th>
                <th>Fine Amount (LKR)</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleFines.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                    {isMyInvoices 
                      ? 'No recorded fines or incident penalties on your account. Safe driving record!' 
                      : isManagerScope
                        ? `No recorded fines or damage penalties for ${currentUser.BranchName}. Excellent safety record!`
                        : 'No recorded fines or damage penalties.'}
                  </td>
                </tr>
              ) : (
                visibleFines.map((f) => (
                  <tr key={f.FineID}>
                    <td>#{f.FineID}</td>
                    <td>{f.FirstName} {f.LastName}</td>
                    <td>{f.RegistrationNumber}</td>
                    <td>
                      <span style={{ color: isManagerScope ? 'var(--yellow)' : 'inherit', fontWeight: isManagerScope ? 600 : 400 }}>
                        {f.BranchName || 'Colombo City Hub'}
                      </span>
                    </td>
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

      {/* 3. Settled Payment History & Receipts */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              🧾 {isMyInvoices ? 'My Completed Payment Receipts' : 'Completed Payment Receipts'}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {isMyInvoices 
                ? 'Your personal settled rental payment ledger • Click "🖨️ Receipt" to print official tax invoices' 
                : isManagerScope
                  ? `Reconciled payment ledger for ${currentUser.BranchName} • Click "🖨️ Receipt" to print official tax invoices`
                  : 'Reconciled payment ledger • Click "🖨️ Receipt" to print official tax invoices'}
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Branch</th>
                <th>Method</th>
                <th>Total Paid (LKR)</th>
                <th>Settlement Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleAllPayments.filter(p => p.PaymentStatus === 'Completed').length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                    {isMyInvoices 
                      ? 'No completed payment receipts found for your account.' 
                      : isManagerScope
                        ? `No completed payments recorded yet for ${currentUser.BranchName}.`
                        : 'No completed payments recorded yet.'}
                  </td>
                </tr>
              ) : (
                visibleAllPayments.filter(p => p.PaymentStatus === 'Completed').map((p) => (
                  <tr key={p.PaymentID}>
                    <td><strong style={{ color: '#eab308' }}>#REC-{p.PaymentID}</strong></td>
                    <td>{p.FirstName} {p.LastName}</td>
                    <td>{p.Make} {p.Model} ({p.RegistrationNumber})</td>
                    <td>
                      <span style={{ color: isManagerScope ? 'var(--yellow)' : 'inherit', fontWeight: isManagerScope ? 600 : 400 }}>
                        {p.BranchName || 'Colombo City Hub'}
                      </span>
                    </td>
                    <td>
                      <span className="badge available">
                        {p.PaymentMethod === 'Credit Card' ? '💳 Card' : p.PaymentMethod === 'Bank Transfer' ? '🏦 Bank Wire' : p.PaymentMethod}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#34d399' }}>
                      LKR {Number(p.Amount).toLocaleString()}
                    </td>
                    <td>{new Date(p.PaymentDate).toLocaleDateString()}</td>
                    <td>
                      {onViewReceipt && (
                        <button 
                          className="btn-primary btn-sm"
                          onClick={() => onViewReceipt(p)}
                        >
                          🖨️ Receipt
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
    </>
  );
}
