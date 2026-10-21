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
  allVehicles = []
}) {
  if (!modalState || !modalState.type) return null;

  const { type, data } = modalState;

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
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  required 
                  className="form-input" 
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input 
                  type="date" 
                  required 
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
                <label className="form-label">Invoice</label>
                <input 
                  className="form-input" 
                  disabled 
                  value={`Payment #${data.PaymentID} - LKR ${Number(data.Amount).toLocaleString()}`} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select 
                  className="form-input" 
                  value={formData.method || 'Credit Card'} 
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                >
                  <option value="Credit Card" style={{ background: '#1a1a1a', color: '#ffffff' }}>Credit Card</option>
                  <option value="Bank Transfer" style={{ background: '#1a1a1a', color: '#ffffff' }}>Bank Transfer</option>
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
            <div className="form-group">
              <label className="form-label">New Vehicle Status</label>
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
          )}

          {type === 'update_maint_status' && (
            <div className="form-group">
              <label className="form-label">Maintenance Status</label>
              <select 
                className="form-input" 
                value={formData.status || 'Completed'} 
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In_Progress">In_Progress</option>
                <option value="Completed">Completed (Auto-resets car to Available)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-submit"
            disabled={modalLoading}
          >
            {modalLoading ? 'Executing MySQL Stored Procedure...' : 'Execute Operation (SP)'}
          </button>
        </form>
      </div>
    </div>
  );
}
