import React from 'react';

export default function ActionModal({
  modalState,
  onClose,
  formData,
  setFormData,
  modalError,
  modalLoading,
  onSubmit,
  categories = [],
  branches = [],
  allVehicles = [],
  bookings = [],
  customers = [],
  currentUser
}) {
  if (!modalState || !modalState.type) return null;

  const { type, data } = modalState;

  const isBranchStaff = (currentUser?.RoleName === 'Branch Manager' || currentUser?.RoleName === 'Rental Staff') && currentUser?.BranchID != null;

  // Filter selectable vehicles for maintenance by branch if user is Branch Manager / Staff
  const selectableVehicles = React.useMemo(() => {
    if (isBranchStaff && currentUser?.BranchID != null) {
      const userBranchId = Number(currentUser.BranchID);
      const filtered = allVehicles.filter(v => Number(v.BranchID) === userBranchId || (currentUser.BranchName && v.BranchName === currentUser.BranchName));
      return filtered.length > 0 ? filtered : allVehicles;
    }
    return allVehicles;
  }, [isBranchStaff, currentUser, allVehicles]);

  // Active bookings for the currently selected vehicle
  const activeVehicleBookings = React.useMemo(() => {
    if (type !== 'book_vehicle' || !data?.VehicleID || !bookings) return [];
    return bookings.filter(b =>
      Number(b.VehicleID) === Number(data.VehicleID) &&
      ['Pending', 'Confirmed'].includes(b.Status)
    );
  }, [type, data, bookings]);

  // Check if chosen dates collide with any active bookings
  const dateConflict = React.useMemo(() => {
    if (type !== 'book_vehicle' || !formData.startDate || !formData.endDate) return null;
    const reqStart = new Date(formData.startDate);
    const reqEnd = new Date(formData.endDate);
    if (isNaN(reqStart.getTime()) || isNaN(reqEnd.getTime())) return null;

    const s1 = formData.startDate;
    const e1 = formData.endDate;

    return activeVehicleBookings.find(b => {
      const s2 = new Date(b.StartDate).toISOString().split('T')[0];
      const e2 = new Date(b.EndDate).toISOString().split('T')[0];
      return (s1 <= e2 && e1 >= s2);
    });
  }, [type, formData.startDate, formData.endDate, activeVehicleBookings]);

  // Bank Payment Gateway & 3D Secure State
  const [bookingStep, setBookingStep] = React.useState(1);
  const [cardData, setCardData] = React.useState({
    number: '4532 8920 4410 7821',
    name: 'RAVINDU SANDARUWAN',
    expiry: '12/28',
    cvv: '482',
    brand: 'visa',
    bank: 'Commercial Bank of Ceylon'
  });
  const [payError, setPayError] = React.useState('');
  const [isAuthorizing, setIsAuthorizing] = React.useState(false);
  const [authStatusMessage, setAuthStatusMessage] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('849203');
  const [enteredOtp, setEnteredOtp] = React.useState('849203');

  // Tiered realistic security deposit calculation based on vehicle category / daily rate
  const depositAmount = React.useMemo(() => {
    const rate = Number(data?.DailyRate) || 0;
    if (rate < 12000) return 15000;
    if (rate < 25000) return 25000;
    if (rate < 40000) return 35000;
    return 50000;
  }, [data?.DailyRate]);

  // Calculate rental duration in days
  const rentalDays = React.useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 1;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
  }, [formData.startDate, formData.endDate]);

  const estimatedTotal = (Number(data?.DailyRate) || 0) * rentalDays;

  // Initialize cardholder name from current logged-in user
  React.useEffect(() => {
    if (type === 'book_vehicle') {
      setBookingStep(1);
      setPayError('');
      setIsAuthorizing(false);
      setAuthStatusMessage('');
      const defaultName = currentUser?.FullName || 
        (customers.find(c => c.CustomerID === (formData.customerId || 1)) 
          ? `${customers.find(c => c.CustomerID === (formData.customerId || 1)).FirstName} ${customers.find(c => c.CustomerID === (formData.customerId || 1)).LastName}`
          : 'RAVINDU SANDARUWAN');
      const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
      setOtpCode(generatedOtp);
      setEnteredOtp(generatedOtp);
      setCardData({
        number: '4532 8920 4410 7821',
        name: defaultName.toUpperCase(),
        expiry: '12/28',
        cvv: '482',
        brand: 'visa',
        bank: 'Commercial Bank of Ceylon'
      });
    }
  }, [type, data?.VehicleID]);

  const handleCardNumberChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})/g, '$1 ').trim();
    let brand = 'visa';
    if (digits.startsWith('5')) brand = 'mastercard';
    else if (digits.startsWith('3')) brand = 'amex';
    setCardData(prev => ({ ...prev, number: formatted, brand }));
    if (payError) setPayError('');
  };

  const handleExpiryChange = (val) => {
    let clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length > 2) {
      clean = clean.slice(0, 2) + '/' + clean.slice(2);
    }
    setCardData(prev => ({ ...prev, expiry: clean }));
    if (payError) setPayError('');
  };

  const handleCvvChange = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    setCardData(prev => ({ ...prev, cvv: clean }));
    if (payError) setPayError('');
  };

  const handleNextToPayment = (e) => {
    if (e) e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      setPayError('Please select both reservation start and end dates.');
      return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setPayError('End date cannot be prior to start date.');
      return;
    }
    if (dateConflict) {
      setPayError('Selected dates collide with an existing reservation.');
      return;
    }
    setPayError('');
    setFormData(prev => ({
      ...prev,
      depositAmount: depositAmount
    }));
    setBookingStep(2);
  };

  const handleProceedTo3DSecure = (e) => {
    if (e) e.preventDefault();
    const rawNumber = cardData.number.replace(/\s+/g, '');
    if (rawNumber.length < 15) {
      setPayError('Please enter a valid 16-digit credit or debit card number.');
      return;
    }
    if (cardData.expiry.length < 5) {
      setPayError('Please enter expiration date in MM/YY format (e.g. 12/28).');
      return;
    }
    if (cardData.cvv.length < 3) {
      setPayError('Please enter the 3-digit CVV security code printed on the back of your card.');
      return;
    }

    setPayError('');
    setIsAuthorizing(true);
    setAuthStatusMessage(`Connecting to ${cardData.bank} 3D Secure 2.0 Gateway...`);

    setTimeout(() => {
      setIsAuthorizing(false);
      setBookingStep(3);
    }, 850);
  };

  const handleVerifyOtpAndConfirm = (e) => {
    if (e) e.preventDefault();
    if (!enteredOtp || enteredOtp.length < 6) {
      setPayError('Please enter the 6-digit One-Time Password (OTP) sent to your phone.');
      return;
    }

    setPayError('');
    setIsAuthorizing(true);
    setAuthStatusMessage(`Authenticating OTP with ${cardData.bank} 3D Secure Gateway...`);

    setTimeout(() => {
      const authRef = `CBC-AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
      setAuthStatusMessage(`✓ 3D Secure Authentication Successful! (${authRef})`);
    }, 900);

    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        depositAmount: depositAmount
      }));
      onSubmit(e);
    }, 1800);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (type === 'book_vehicle') {
      if (bookingStep === 1) {
        handleNextToPayment(e);
      } else if (bookingStep === 2) {
        handleProceedTo3DSecure(e);
      } else {
        handleVerifyOtpAndConfirm(e);
      }
      return;
    }
    onSubmit(e);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {type === 'book_vehicle' && (
                bookingStep === 1 
                  ? '⚡ Reserve Vehicle' 
                  : bookingStep === 2 
                    ? '💳 Secure Online Deposit Payment' 
                    : '🛡️ 3D Secure 2.0 Bank Verification'
              )}
              {type === 'add_vehicle' && '🚗 Register New Vehicle'}
              {type === 'start_rental' && '🔑 Dispatch Vehicle (Check-Out)'}
              {type === 'return_vehicle' && '↩️ Process Vehicle Return (Check-In)'}
              {type === 'process_payment' && '💳 Settle Outstanding Payment'}
              {type === 'schedule_maintenance' && '🛠️ Schedule Workshop Maintenance'}
              {type === 'update_vehicle_status' && '🚗 Update Vehicle Status'}
              {type === 'update_maint_status' && '🛠️ Update Maintenance Status'}
            </h3>
            <div className="modal-subtitle">
              {type === 'book_vehicle' && (
                bookingStep === 1 
                  ? 'Step 1 of 3: Select rental schedule & review pricing breakdown' 
                  : bookingStep === 2 
                    ? 'Step 2 of 3: Enter credit / debit card credentials (SSL 256-Bit Encrypted)' 
                    : 'Step 3 of 3: Enter One-Time Password (OTP) dispatched by issuing bank'
              )}
              {type === 'add_vehicle' && 'Register a new fleet asset into branch inventory'}
              {type === 'start_rental' && 'Dispatch vehicle and record customer check-out'}
              {type === 'return_vehicle' && 'Record final odometer mileage and check-in vehicle'}
              {type === 'process_payment' && 'Process transaction and issue customer tax receipt'}
              {type === 'schedule_maintenance' && 'Book vehicle inspection and workshop maintenance'}
              {type === 'update_vehicle_status' && 'Update fleet availability and operational readiness'}
              {type === 'update_maint_status' && 'Update service progress and workshop repair status'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {modalError && (
          <div className="alert-error">
            <span>⚠️ {modalError}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          {/* BOOK VEHICLE FORM - STEP 1: DATES & SUMMARY */}
          {type === 'book_vehicle' && bookingStep === 1 && (
            <>
              <div className="paygate-steps">
                <div className="paygate-step-item active">
                  <span className="paygate-step-num">1</span>
                  <span>Schedule</span>
                </div>
                <div className="paygate-step-divider" />
                <div className="paygate-step-item">
                  <span className="paygate-step-num">2</span>
                  <span>Card Details</span>
                </div>
                <div className="paygate-step-divider" />
                <div className="paygate-step-item">
                  <span className="paygate-step-num">3</span>
                  <span>3D Secure</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle</label>
                <input
                  className="form-input"
                  disabled
                  value={`${data.Make} ${data.Model} (${data.RegistrationNumber}) - LKR ${Number(data.DailyRate).toLocaleString()}/day`}
                />
              </div>

              {currentUser?.RoleName !== 'Customer' && customers && customers.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Customer to Reserve For *</label>
                  <select
                    className="form-input"
                    value={formData.customerId || customers[0]?.CustomerID}
                    onChange={(e) => setFormData({ ...formData, customerId: parseInt(e.target.value) })}
                  >
                    {customers.map((c) => (
                      <option key={c.CustomerID} value={c.CustomerID}>
                        {c.FirstName} {c.LastName} ({c.Phone || c.Email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeVehicleBookings.length > 0 ? (
                <div style={{
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.825rem'
                }}>
                  <div style={{ fontWeight: 600, color: '#facc15', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>🔒</span> Confirmed Upcoming Bookings for this Vehicle:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {activeVehicleBookings.map((b) => (
                      <div key={b.BookingID} style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
                        • <strong style={{ color: '#f1f5f9' }}>{new Date(b.StartDate).toLocaleDateString()}</strong> to <strong style={{ color: '#f1f5f9' }}>{new Date(b.EndDate).toLocaleDateString()}</strong>
                        <span style={{ color: '#eab308', marginLeft: '0.35rem', fontWeight: 600 }}>({b.Status})</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '0.4rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                    🛡️ <strong>Double-Booking Protection:</strong> You can select any open dates before or after these reserved periods. The system automatically blocks overlapping dates so no two customers can ever take the car at the same time.
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  color: '#4ade80'
                }}>
                  ✓ No upcoming bookings for this car. All dates available!
                </div>
              )}

              {dateConflict && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  marginBottom: '1rem',
                  fontSize: '0.825rem',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>⚠️</span>
                  <div>
                    <strong>Date Overlap:</strong> Collides with an existing booking from <strong>{new Date(dateConflict.StartDate).toLocaleDateString()}</strong> to <strong>{new Date(dateConflict.EndDate).toLocaleDateString()}</strong>.
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Pickup Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Return Date *</label>
                  <input
                    type="date"
                    required
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="form-input"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Pricing Breakdown & Security Deposit */}
              <div className="paygate-breakdown-card" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                <div className="paygate-breakdown-row">
                  <span>Daily Rental Rate:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>LKR {Number(data.DailyRate).toLocaleString()} / day</span>
                </div>
                <div className="paygate-breakdown-row">
                  <span>Estimated Duration:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                </div>
                <div className="paygate-breakdown-row">
                  <span>Rental Subtotal (Est.):</span>
                  <span style={{ color: '#fff' }}>LKR {estimatedTotal.toLocaleString()}</span>
                </div>
                <div className="paygate-breakdown-row highlight">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>Required Security Deposit:</span>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 500 }}>
                      🛡️ 100% Refundable at vehicle check-in
                    </span>
                  </div>
                  <span className="paygate-deposit-amount">LKR {depositAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Online Card Payment Policy Notice */}
              <div className="paygate-policy-badge" style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1.25rem' }}>💳</div>
                <div>
                  <strong>Online Reservation Policy:</strong> Security advance deposit must be authorized strictly via <strong>Credit / Debit Card</strong> online. Counter payment (Cash / Wire) is only available for rental balance upon physical vehicle check-out at branch.
                </div>
              </div>

              {payError && (
                <div className="alert-error" style={{ marginBottom: '1rem' }}>
                  <span>⚠️ {payError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextToPayment}
                disabled={modalLoading || !!dateConflict || !formData.startDate || !formData.endDate}
                className="btn-submit"
                style={dateConflict || !formData.startDate || !formData.endDate ? { opacity: 0.6, cursor: 'not-allowed', background: '#334155', color: '#94a3b8' } : {}}
              >
                {dateConflict ? '⚠️ Dates Overlap (Select Open Dates)' : `Proceed to Card Deposit Payment (LKR ${depositAmount.toLocaleString()}) ➔`}
              </button>
            </>
          )}

          {/* BOOK VEHICLE FORM - STEP 2: AUTHENTIC CARD PAYMENT ENTRY */}
          {type === 'book_vehicle' && bookingStep === 2 && (
            <div className="paygate-container">
              <div className="paygate-steps">
                <div className="paygate-step-item">
                  <span className="paygate-step-num">✓</span>
                  <span>Schedule</span>
                </div>
                <div className="paygate-step-divider active" />
                <div className="paygate-step-item active">
                  <span className="paygate-step-num">2</span>
                  <span>Card Details</span>
                </div>
                <div className="paygate-step-divider" />
                <div className="paygate-step-item">
                  <span className="paygate-step-num">3</span>
                  <span>3D Secure</span>
                </div>
              </div>

              {isAuthorizing ? (
                <div className="paygate-processing-modal">
                  <div className="paygate-spinner"></div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--yellow)', letterSpacing: '0.5px' }}>
                    Card Gateway
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#f1f5f9', minHeight: '24px' }}>
                    {authStatusMessage}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                    🔒 Establishing bank encrypted session. Please wait...
                  </div>
                </div>
              ) : (
                <>
                  <div className="paygate-breakdown-card">
                    <div className="paygate-breakdown-row">
                      <span>Vehicle:</span>
                      <strong style={{ color: '#fff' }}>{data.Make} {data.Model}</strong>
                    </div>
                    <div className="paygate-breakdown-row">
                      <span>Rental Schedule:</span>
                      <span>{formData.startDate} ➔ {formData.endDate} ({rentalDays} d)</span>
                    </div>
                    <div className="paygate-breakdown-row highlight">
                      <span>Advance Deposit Due (Card Only):</span>
                      <span className="paygate-deposit-amount">LKR {depositAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>✓</span> Refundable to card upon successful vehicle return inspection.
                    </div>
                  </div>

                  {/* Accepted Card Brands Strip */}
                  <div className="paygate-accepted-strip">
                    <span className="paygate-accepted-label">Accepted Networks:</span>
                    <div className="paygate-card-badges">
                      <span className={`paygate-badge-item ${cardData.brand === 'visa' ? 'active' : ''}`}>VISA</span>
                      <span className={`paygate-badge-item ${cardData.brand === 'mastercard' ? 'active' : ''}`}>Mastercard</span>
                      <span className={`paygate-badge-item ${cardData.brand === 'amex' ? 'active' : ''}`}>AMEX</span>
                      <span className="paygate-badge-item">LankaPay</span>
                    </div>
                  </div>

                  {/* Luxury Bank Card Preview */}
                  <div className="paygate-card-preview">
                    <div className="paygate-card-top">
                      <div className="paygate-card-bank-block">
                        <div className="paygate-card-bank-name">
                          <span>🏛️</span> {cardData.bank.toUpperCase()}
                        </div>
                        <div className="paygate-card-tier-tag">
                          PLATINUM REWARDS DEBIT
                        </div>
                      </div>
                      <div className={`paygate-network-logo ${cardData.brand}`}>
                        {cardData.brand === 'mastercard' ? (
                          <div className="paygate-network-logo mastercard">
                            <span className="paygate-mc-circle red"></span>
                            <span className="paygate-mc-circle yellow"></span>
                          </div>
                        ) : cardData.brand === 'amex' ? 'AMEX' : 'VISA'}
                      </div>
                    </div>
                    <div className="paygate-card-mid">
                      <div className="paygate-card-chip"></div>
                      <span className="paygate-card-contactless">📶</span>
                    </div>
                    <div className="paygate-card-number">
                      {cardData.number || '•••• •••• •••• ••••'}
                    </div>
                    <div className="paygate-card-bottom">
                      <div className="paygate-card-holder-group">
                        <span className="paygate-card-label">Cardholder</span>
                        <span className="paygate-card-val">{cardData.name || 'VALUED CUSTOMER'}</span>
                      </div>
                      <div className="paygate-card-expiry-group">
                        <span className="paygate-card-label">Valid Thru</span>
                        <span className="paygate-card-val">{cardData.expiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label">Card Issuing Bank</label>
                    <select
                      className="form-input"
                      value={cardData.bank}
                      onChange={(e) => setCardData(prev => ({ ...prev, bank: e.target.value }))}
                    >
                      <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon (ComBank)</option>
                      <option value="Sampath Bank PLC">Sampath Bank PLC</option>
                      <option value="Hatton National Bank">Hatton National Bank (HNB)</option>
                      <option value="Bank of Ceylon">Bank of Ceylon (BOC)</option>
                      <option value="Nations Trust Bank">Nations Trust Bank (NTB)</option>
                      <option value="Standard Chartered">Standard Chartered Bank</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label">Cardholder Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. RAVINDU SANDARUWAN"
                      value={cardData.name}
                      onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label">Card Number *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="4532 8920 4410 7821"
                        value={cardData.number}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        maxLength={19}
                        required
                      />
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--yellow)', fontWeight: 700 }}>
                        {cardData.brand.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Expiry (MM/YY) *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">CVV / CVC (3-digits) *</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="•••"
                        value={cardData.cvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="paygate-trust-footer">
                    <span>🔒 256-Bit TLS Bank Encryption</span>
                    <span>🛡️ PCI-DSS Level 1</span>
                    <span>⚡ 3D Secure 2.0</span>
                  </div>

                  {payError && (
                    <div className="alert-error" style={{ margin: '0.75rem 0' }}>
                      <span>⚠️ {payError}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ flex: 1 }}
                      disabled={modalLoading || isAuthorizing}
                      onClick={() => { setBookingStep(1); setPayError(''); }}
                    >
                      ← Back to Schedule
                    </button>
                    <button
                      type="button"
                      className="btn-submit"
                      style={{ flex: 2, margin: 0 }}
                      disabled={modalLoading || isAuthorizing}
                      onClick={handleProceedTo3DSecure}
                    >
                      🔒 Proceed to 3D Secure (LKR {depositAmount.toLocaleString()}) ➔
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* BOOK VEHICLE FORM - STEP 3: 3D SECURE 2.0 BANK SMS OTP AUTHENTICATION */}
          {type === 'book_vehicle' && bookingStep === 3 && (
            <div className="paygate-container">
              <div className="paygate-steps">
                <div className="paygate-step-item">
                  <span className="paygate-step-num">✓</span>
                  <span>Schedule</span>
                </div>
                <div className="paygate-step-divider active" />
                <div className="paygate-step-item">
                  <span className="paygate-step-num">✓</span>
                  <span>Card Details</span>
                </div>
                <div className="paygate-step-divider active" />
                <div className="paygate-step-item active">
                  <span className="paygate-step-num">3</span>
                  <span>3D Secure</span>
                </div>
              </div>

              {isAuthorizing ? (
                <div className="paygate-processing-modal">
                  <div className="paygate-spinner"></div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--yellow)', letterSpacing: '0.5px' }}>
                    3D Secure 2.0 Verification
                  </div>
                  <div style={{ fontSize: '0.92rem', color: '#f1f5f9', minHeight: '24px' }}>
                    {authStatusMessage}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                    🔒 Authorizing transaction with {cardData.bank}. Please do not refresh.
                  </div>
                </div>
              ) : (
                <div className="paygate-3ds-container">
                  {/* Real incoming bank SMS notification toast */}
                  <div className="paygate-sms-alert">
                    <div className="paygate-sms-icon">💬</div>
                    <div className="paygate-sms-body">
                      <div className="paygate-sms-header">
                        <span>SMS Alert • {cardData.bank}</span>
                        <span className="paygate-sms-time">Just now</span>
                      </div>
                      <div className="paygate-sms-text">
                        Your OTP is <strong style={{ color: 'var(--yellow)', letterSpacing: '1px' }}>{otpCode}</strong> for transaction of LKR {depositAmount.toLocaleString()}.00 at RENTO LANKA FLEET SERVICES. Valid for 5 mins.
                      </div>
                    </div>
                  </div>

                  {/* 3D Secure Challenge Box */}
                  <div className="paygate-3ds-card">
                    <div className="paygate-3ds-top">
                      <div className="paygate-3ds-brand">
                        {cardData.brand === 'mastercard' ? 'Mastercard Identity Check™' : 'Verified by VISA®'}
                      </div>
                      <div className="paygate-3ds-bank">
                        {cardData.bank}
                      </div>
                    </div>

                    <div className="paygate-3ds-intro">
                      Please enter the 6-digit One-Time Password (OTP) dispatched via SMS to your registered mobile ending in <strong>•82</strong> to authorize this advance security deposit.
                    </div>

                    <div className="paygate-3ds-meta-table">
                      <div className="paygate-3ds-row">
                        <span>Merchant:</span>
                        <strong>Rento Lanka Fleet Services (Pvt) Ltd</strong>
                      </div>
                      <div className="paygate-3ds-row">
                        <span>Transaction Amount:</span>
                        <strong style={{ color: 'var(--yellow)' }}>LKR {depositAmount.toLocaleString()}.00</strong>
                      </div>
                      <div className="paygate-3ds-row">
                        <span>Card:</span>
                        <span>•••• •••• •••• {cardData.number.replace(/\s/g, '').slice(-4) || '7821'}</span>
                      </div>
                      <div className="paygate-3ds-row">
                        <span>Date & Time:</span>
                        <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: '1.25rem 0 0.5rem 0', textAlign: 'center' }}>
                      <label className="form-label" style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 700 }}>
                        Enter 6-Digit SMS OTP
                      </label>
                      <input
                        type="text"
                        className="form-input paygate-otp-input"
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        autoFocus
                      />
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Didn't receive SMS? <span style={{ color: 'var(--yellow)', cursor: 'pointer', textDecoration: 'underline' }}>Resend OTP (0:45)</span>
                    </div>

                    {payError && (
                      <div className="alert-error" style={{ marginBottom: '1rem' }}>
                        <span>⚠️ {payError}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ flex: 1 }}
                        disabled={modalLoading || isAuthorizing}
                        onClick={() => { setBookingStep(2); setPayError(''); }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-submit"
                        style={{ flex: 2, margin: 0 }}
                        disabled={modalLoading || isAuthorizing || enteredOtp.length < 6}
                        onClick={handleVerifyOtpAndConfirm}
                      >
                        Submit OTP & Complete Payment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADD VEHICLE FORM */}
          {type === 'add_vehicle' && (
            <>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={formData.categoryId || 1}
                  onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                >
                  {categories.map((c) => (
                    <option key={c.CategoryID} value={c.CategoryID}>
                      {c.CategoryName} (LKR {Number(c.DailyRate).toLocaleString()}/day)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Branch {isBranchStaff ? '(Assigned Location)' : ''}</label>
                <select
                  className="form-input"
                  value={formData.branchId || (isBranchStaff ? currentUser.BranchID : 1)}
                  disabled={isBranchStaff}
                  onChange={(e) => setFormData({ ...formData, branchId: parseInt(e.target.value) })}
                >
                  {branches.map((b) => (
                    <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>
                  ))}
                </select>
                {isBranchStaff && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--yellow)', marginTop: '0.35rem' }}>
                    🔒 Automatically registered to your branch: {currentUser.BranchName}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Make & Model</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    placeholder="Make (e.g. Toyota)"
                    required
                    className="form-input"
                    value={formData.make || ''}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  />
                  <input
                    placeholder="Model (e.g. Prius)"
                    required
                    className="form-input"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Registration Plate & Year</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                  <input
                    placeholder="Plate (e.g. CBF-8899)"
                    required
                    className="form-input"
                    value={formData.registration || ''}
                    onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                  />
                  <input
                    placeholder="Year"
                    type="number"
                    required
                    className="form-input"
                    value={formData.year || 2024}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={formData.purchaseDate || ''}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
            </>
          )}

          {/* START RENTAL FORM */}
          {type === 'start_rental' && (
            <>
              <div className="form-group">
                <label className="form-label">Booking Details</label>
                <input
                  className="form-input"
                  disabled
                  value={`Booking #${data.BookingID} - ${data.Make} ${data.Model}`}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Odometer Start Mileage (km)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={formData.startMileage || 10000}
                  onChange={(e) => setFormData({ ...formData, startMileage: parseInt(e.target.value) })}
                />
              </div>
            </>
          )}

          {/* RETURN VEHICLE FORM */}
          {type === 'return_vehicle' && (
            <>
              <div className="form-group">
                <label className="form-label">Rental</label>
                <input
                  className="form-input"
                  disabled
                  value={`Rental #${data.RentalID} (${data.Make} ${data.Model})`}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Odometer End Mileage (km)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={formData.endMileage || 12000}
                  onChange={(e) => setFormData({ ...formData, endMileage: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Damage Assessment Fee (LKR)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.damageCost || 0}
                  onChange={(e) => setFormData({ ...formData, damageCost: parseFloat(e.target.value) })}
                />
              </div>
            </>
          )}

          {/* PROCESS PAYMENT FORM */}
          {type === 'process_payment' && (
            <>
              <div className="form-group">
                <label className="form-label">Invoice Details</label>
                <input
                  className="form-input"
                  disabled
                  value={`Payment #${data.PaymentID} • ${data.FirstName} ${data.LastName} - LKR ${Number(data.Amount).toLocaleString()}`}
                />
              </div>

              {Number(data.TotalFines) > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.825rem'
                }}>
                  <div style={{ fontWeight: 600, color: '#f87171', marginBottom: '0.35rem' }}>
                    📋 Consolidated Bill Breakdown:
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    • Base Rental Charge: <strong style={{ color: '#f1f5f9' }}>LKR {(Number(data.Amount) - Number(data.TotalFines)).toLocaleString()}</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    • Assessed Penalties (Late / Damage): <strong style={{ color: '#f87171' }}>LKR {Number(data.TotalFines).toLocaleString()}</strong>
                  </div>
                  <div style={{ marginTop: '0.4rem', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '0.35rem', color: '#34d399', fontWeight: 700 }}>
                    Total Amount Due: LKR {Number(data.Amount).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-input"
                  value={formData.method || 'Credit Card'}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                >
                  <option value="Credit Card" style={{ background: '#1a1a1a', color: '#ffffff' }}>💳 Credit / Debit Card (Visa / Mastercard)</option>
                  <option value="Bank Transfer" style={{ background: '#1a1a1a', color: '#ffffff' }}>🏦 Bank Transfer (Direct Deposit)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount Received (LKR)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={formData.amount || data.Amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                />
              </div>
            </>
          )}

          {/* SCHEDULE MAINTENANCE FORM */}
          {type === 'schedule_maintenance' && (
            <>
              <div className="form-group">
                <label className="form-label">Vehicle {isBranchStaff ? `(${currentUser.BranchName} Fleet)` : ''}</label>
                <select
                  className="form-input"
                  value={formData.vehicleId || selectableVehicles[0]?.VehicleID || 1}
                  onChange={(e) => setFormData({ ...formData, vehicleId: parseInt(e.target.value) })}
                >
                  {selectableVehicles.map((v) => (
                    <option key={v.VehicleID} value={v.VehicleID}>
                      {v.RegistrationNumber} - {v.Make} {v.Model} ({v.BranchName || 'Branch'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Branch {isBranchStaff ? '(Assigned Workshop)' : ''}</label>
                <select
                  className="form-input"
                  value={formData.branchId || (isBranchStaff ? currentUser.BranchID : 1)}
                  disabled={isBranchStaff}
                  onChange={(e) => setFormData({ ...formData, branchId: parseInt(e.target.value) })}
                >
                  {branches.map((b) => (
                    <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>
                  ))}
                </select>
                {isBranchStaff && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--yellow)', marginTop: '0.35rem' }}>
                    🔒 Automatically scheduled at your branch workshop: {currentUser.BranchName}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Service Cost (LKR)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={formData.cost || 25000}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Service Description</label>
                <input
                  required
                  className="form-input"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </>
          )}

          {/* UPDATE STATUS FORMS */}
          {type === 'update_vehicle_status' && (
            <>
              <div className="form-group">
                <label className="form-label">Vehicle</label>
                <input
                  className="form-input"
                  disabled
                  value={`Vehicle #${data?.VehicleID} • ${data?.Make || ''} ${data?.Model || ''} (${data?.RegistrationNumber || ''})`}
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Vehicle Status *</label>
                <select
                  className="form-input"
                  value={formData.status || 'Available'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                  <option value="Maintenance_Required">Maintenance_Required</option>
                  <option value="In_Maintenance">In_Maintenance</option>
                  <option value="Out_Of_Service">Out_Of_Service</option>
                </select>
              </div>
            </>
          )}

          {type === 'update_maint_status' && (
            <>
              <div className="form-group">
                <label className="form-label">Maintenance Ticket</label>
                <input
                  className="form-input"
                  disabled
                  value={`Ticket #${data?.MaintenanceID} • ${data?.RegistrationNumber || ''} (${data?.BranchName || ''})`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Maintenance Status *</label>
                <select
                  className="form-input"
                  value={formData.status || 'Completed'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Scheduled">Scheduled (In Queue)</option>
                  <option value="In_Progress">In_Progress (Under Service)</option>
                  <option value="Completed">Completed (Restores Vehicle to Available)</option>
                  <option value="Cancelled">Cancelled (Aborted)</option>
                </select>
              </div>

              {formData.status === 'Completed' && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  marginBottom: '1rem',
                  fontSize: '0.82rem',
                  color: '#4ade80'
                }}>
                  ✓ <strong>Fleet Return Automation:</strong> Marking as <em>Completed</em> will automatically restore this vehicle to <strong>Available</strong> status in the fleet.
                </div>
              )}
            </>
          )}

          {type !== 'book_vehicle' && (
            <button
              type="submit"
              className="btn-submit"
              disabled={modalLoading || !!dateConflict}
              style={dateConflict ? { opacity: 0.6, cursor: 'not-allowed', background: '#475569', color: '#94a3b8' } : {}}
            >
              {modalLoading ? 'Processing Request...' : dateConflict ? 'Dates Overlap (Select Open Dates)' : 'Confirm & Proceed'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
