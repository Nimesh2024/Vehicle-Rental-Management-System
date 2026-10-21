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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {type === 'book_vehicle' && '⚡ Reserve Vehicle'}
              {type === 'add_vehicle' && '🚗 Register New Vehicle'}
              {type === 'start_rental' && '🔑 Dispatch Vehicle (Check-Out)'}
              {type === 'return_vehicle' && '↩️ Process Vehicle Return (Check-In)'}
              {type === 'process_payment' && '💳 Settle Outstanding Payment'}
              {type === 'schedule_maintenance' && '🛠️ Schedule Workshop Maintenance'}
              {type === 'update_vehicle_status' && '🚗 Update Vehicle Status'}
              {type === 'update_maint_status' && '🛠️ Update Maintenance Status'}
            </h3>
            <div className="modal-subtitle">
              {type === 'book_vehicle' && 'Member 3 Stored Procedure: ConfirmBooking()'}
              {type === 'add_vehicle' && 'Member 2 Stored Procedure: AddVehicle() with Transaction'}
              {type === 'start_rental' && 'Member 3 Stored Procedure: CreateRental()'}
              {type === 'return_vehicle' && 'Member 4 Stored Procedure: ProcessVehicleReturn() with Late/Damage Fines'}
              {type === 'process_payment' && 'Member 4 Stored Procedure: ProcessPayment()'}
              {type === 'schedule_maintenance' && 'Member 5 Stored Procedure: AddMaintenanceRecord()'}
              {type === 'update_vehicle_status' && 'Member 2 Stored Procedure: UpdateVehicleStatus()'}
              {type === 'update_maint_status' && 'Member 5 Stored Procedure: UpdateMaintenanceStatus()'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {modalError && (
          <div className="alert-error">
            <span>⚠️ {modalError}</span>
          </div>
        )}

        <form onSubmit={onSubmit}>
          {/* BOOK VEHICLE FORM */}
          {type === 'book_vehicle' && (
            <>
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
                    <span>🔒</span> Reserved Dates for this Vehicle:
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
                    💡 Please select dates outside these reserved periods, or choose another available vehicle.
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

              <div className="form-group">
                <label className="form-label">Start Date *</label>
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
                <label className="form-label">End Date *</label>
                <input 
                  type="date" 
                  required 
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="form-input" 
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} 
                />
              </div>
            </>
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
                <label className="form-label">Branch</label>
                <select 
                  className="form-input" 
                  value={formData.branchId || 1} 
                  onChange={(e) => setFormData({ ...formData, branchId: parseInt(e.target.value) })}
                >
                  {branches.map((b) => (
                    <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>
                  ))}
                </select>
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
                    📋 Consolidated Bill Breakdown (CalculateFinalBill UDF):
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
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
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
                <label className="form-label">Vehicle</label>
                <select 
                  className="form-input" 
                  value={formData.vehicleId || 1} 
                  onChange={(e) => setFormData({ ...formData, vehicleId: parseInt(e.target.value) })}
                >
                  {allVehicles.map((v) => (
                    <option key={v.VehicleID} value={v.VehicleID}>
                      {v.RegistrationNumber} - {v.Make} {v.Model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <select 
                  className="form-input" 
                  value={formData.branchId || 1} 
                  onChange={(e) => setFormData({ ...formData, branchId: parseInt(e.target.value) })}
                >
                  {branches.map((b) => (
                    <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>
                  ))}
                </select>
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
                  <option value="Completed">Completed (Auto-resets Car to Available)</option>
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
                  ✓ <strong>Trigger ChangeVehToAvailable:</strong> Marking as <em>Completed</em> will automatically restore this vehicle to <strong>Available</strong> status in the fleet.
                </div>
              )}
            </>
          )}

          <button 
            type="submit" 
            className="btn-submit"
            disabled={modalLoading || !!dateConflict}
            style={dateConflict ? { opacity: 0.6, cursor: 'not-allowed', background: '#475569', color: '#94a3b8' } : {}}
          >
            {modalLoading ? 'Executing MySQL Stored Procedure...' : dateConflict ? 'Dates Overlap (Select Open Dates)' : 'Execute Operation (SP)'}
          </button>
        </form>
      </div>
    </div>
  );
}
