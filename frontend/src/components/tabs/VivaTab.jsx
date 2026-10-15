import React, { useState } from 'react';

export default function VivaTab({
  trapResult,
  onRunSimulation
}) {
  const [calcRentalDays, setCalcRentalDays] = useState(5);
  const [calcDailyRate, setCalcDailyRate] = useState(8500);
  const [calcLateDays, setCalcLateDays] = useState(2);
  const [calcLateRate, setCalcLateRate] = useState(8500);
  const [calcDob, setCalcDob] = useState('1998-04-12');

  const calculatedAge = Math.floor(
    (new Date() - new Date(calcDob)) / (365.25 * 24 * 60 * 60 * 1000)
  );

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">🔬 ADBMS Viva Proofs & Concept Demonstrator</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Live demonstration tools for UDF calculations, Stored Procedure Error Handling, and ACID Rollbacks
          </div>
        </div>
      </div>

      {/* Section 1: Live UDF Calculators */}
      <div className="viva-card">
        <div className="viva-title">⚡ 1. Live User-Defined Function (UDF) Calculators (in LKR)</div>
        <div className="calc-grid">
          <div className="calc-box">
            <div>
              <div className="calc-header">CalculateRentalCost()</div>
              <span className="calc-code">CalculateRentalCost(Days, DailyRate)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Days</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ padding: '0.4rem' }} 
                    value={calcRentalDays} 
                    onChange={(e) => setCalcRentalDays(parseInt(e.target.value) || 0)} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Rate (LKR)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ padding: '0.4rem' }} 
                    value={calcDailyRate} 
                    onChange={(e) => setCalcDailyRate(parseFloat(e.target.value) || 0)} 
                  />
                </div>
              </div>
            </div>
            <div className="calc-result-box">
              Rental Cost = LKR {(calcRentalDays * calcDailyRate).toLocaleString()}
            </div>
          </div>

          <div className="calc-box">
            <div>
              <div className="calc-header">CalculateFine()</div>
              <span className="calc-code">CalculateFine(LateDays, DailyRate * 1.5)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Late Days</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ padding: '0.4rem' }} 
                    value={calcLateDays} 
                    onChange={(e) => setCalcLateDays(parseInt(e.target.value) || 0)} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Rate (LKR)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ padding: '0.4rem' }} 
                    value={calcLateRate} 
                    onChange={(e) => setCalcLateRate(parseFloat(e.target.value) || 0)} 
                  />
                </div>
              </div>
            </div>
            <div 
              className="calc-result-box" 
              style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.1)' }}
            >
              Late Penalty = LKR {(calcLateDays * (calcLateRate * 1.5)).toLocaleString()}
            </div>
          </div>

          <div className="calc-box">
            <div>
              <div className="calc-header">CustomerAge()</div>
              <span className="calc-code">TIMESTAMPDIFF(YEAR, DOB, CURDATE())</span>
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date of Birth</label>
                <input 
                  type="date" 
                  className="form-input" 
                  style={{ padding: '0.4rem' }} 
                  value={calcDob} 
                  onChange={(e) => setCalcDob(e.target.value)} 
                />
              </div>
            </div>
            <div className="calc-result-box">
              Calculated Age = {isNaN(calculatedAge) ? 0 : calculatedAge} Years Old
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Error Handling & ACID Rollback Simulator */}
      <div className="viva-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <div className="viva-title" style={{ color: '#f87171' }}>
          🛡️ 2. Stored Procedure Error Handling & Rollback Proofs
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Click any scenario below to trigger a MySQL error constraint. The Stored Procedure's <code>EXIT HANDLER</code> will trap the exception, execute <code>ROLLBACK</code> to preserve ACID consistency, and raise a custom <code>SQLSTATE '45000'</code> error.
        </div>

        <div className="error-trap-box">
          <button className="btn-trap" onClick={() => onRunSimulation('dup_plate')}>
            💥 Scenario A: Insert Duplicate Reg Number (M2 AddVehicle SP)
          </button>
          <button className="btn-trap" onClick={() => onRunSimulation('future_dob')}>
            💥 Scenario B: Register with Future Date of Birth (M1 RegisterCustomer SP)
          </button>
          <button className="btn-trap" onClick={() => onRunSimulation('booking_conflict')}>
            💥 Scenario C: Double-Book Unavailable Vehicle (M3 ConfirmBooking SP)
          </button>
        </div>

        {trapResult && (
          <div className="trap-output">
            {trapResult.status === 'running' ? (
              <span style={{ color: '#60a5fa' }}>⏳ {trapResult.message}</span>
            ) : trapResult.status === 'trapped' ? (
              <div>
                <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '0.35rem' }}>
                  ✅ Database Exception Trapped Successfully!
                </div>
                <div style={{ color: '#f87171' }}><strong>SQL Error Signal:</strong> {trapResult.error}</div>
                <div style={{ color: '#93c5fd' }}><strong>SQLSTATE:</strong> {trapResult.sqlState}</div>
                <div style={{ color: '#a7f3d0' }}><strong>ACID Guarantee:</strong> {trapResult.action}</div>
              </div>
            ) : (
              <div style={{ color: '#fca5a5' }}>Error: {JSON.stringify(trapResult)}</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
