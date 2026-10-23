import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as api from '../../services/api';

export default function DashboardTab({ 
  stats = {}, 
  allVehicles = [], 
  currentUser, 
  onNavigate,
  showToast = () => {} 
}) {
  // Period filter states: 'all' | 'day' | 'month' | 'year'
  const [period, setPeriod] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2026-10-21');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [selectedYear, setSelectedYear] = useState('2026');
  
  // Analytics and Audit Log data
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chart view metric toggle: 'revenue' | 'volume'
  const [chartMetric, setChartMetric] = useState('revenue');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Modal for report printing / viewing
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fetch analytics whenever period or sub-filters change
  const loadExecutiveData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { period };
      if (period === 'day') params.date = selectedDate;
      if (period === 'month') params.month = selectedMonth;
      if (period === 'year') params.year = selectedYear;

      const [analyticsRes, auditRes] = await Promise.all([
        api.fetchExecutiveAnalytics(params),
        api.fetchAuditLogs().catch(() => [])
      ]);

      setAnalytics(analyticsRes);
      setAuditLogs(Array.isArray(auditRes) ? auditRes : []);
    } catch (err) {
      console.error('Failed to load executive analytics:', err);
      setError(err.message || 'Unable to retrieve executive reporting data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecutiveData();
  }, [period, selectedDate, selectedMonth, selectedYear]);

  // Fallback / Normalized values
  const realtime = analytics?.realtime || {
    activeCustomers: stats.customers || 0,
    availableVehicles: stats.vehicles || 0,
    totalVehicles: allVehicles.length || 10,
    ongoingRentals: stats.rentals || 0,
    inMaintenance: stats.maintenance || 0,
    totalPlatformRevenue: stats.totalRevenue || 0,
    utilizationRate: allVehicles.length > 0 
      ? Number(((Number(stats.rentals || 0) / allVehicles.length) * 100).toFixed(1)) 
      : 0
  };

  const summary = analytics?.summary || {
    settledRevenue: stats.totalRevenue || 0,
    pendingRevenue: 0,
    totalRentals: 0,
    completedRentals: 0,
    ongoingRentals: stats.rentals || 0,
    totalBookings: 0,
    totalFines: 0,
    fineCount: 0,
    averageRentalValue: 0
  };

  const timeSeries = analytics?.timeSeries || [];
  const branchBreakdown = analytics?.branchBreakdown || [];
  const categoryBreakdown = analytics?.categoryBreakdown || [];
  const fleetStatus = analytics?.fleetStatusBreakdown || [];
  const ledger = analytics?.ledger || [];

  // Export ledger to CSV
  const handleExportCSV = () => {
    if (!ledger || ledger.length === 0) {
      showToast('No transaction records available to export for this timeframe.');
      return;
    }
    const headers = [
      'Rental ID', 'Booking ID', 'Customer Name', 'Phone', 'Vehicle', 
      'Category', 'Branch', 'Start Date', 'End Date', 'Rental Status', 
      'Amount (LKR)', 'Fines (LKR)', 'Payment Method', 'Payment Status', 'Payment Date'
    ];
    const rows = ledger.map(item => [
      item.RentalID,
      item.BookingID,
      `"${(item.CustomerName || '').replace(/"/g, '""')}"`,
      `"${item.CustomerPhone || ''}"`,
      `"${(item.VehicleInfo || '').replace(/"/g, '""')}"`,
      `"${item.CategoryName || ''}"`,
      `"${item.BranchName || ''}"`,
      item.ActualStartDate ? item.ActualStartDate.split('T')[0] : '',
      item.ActualEndDate ? item.ActualEndDate.split('T')[0] : '',
      item.RentalStatus,
      item.Amount,
      item.TotalFines,
      item.PaymentMethod,
      item.PaymentStatus,
      item.PaymentDate ? item.PaymentDate.split('T')[0] : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rento_Executive_Report_${(analytics?.periodLabel || period).replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Executive ledger CSV downloaded successfully.');
  };

  return (
    <div className="dashboard-wrapper">
      {/* ========================================================
          1. EXECUTIVE HEADER & REPORTING TIMEFRAME CONTROLS
          ======================================================== */}
      <div className="executive-header-card">
        <div className="executive-title-block">
          <div className="executive-badge">
            <i className="fa-solid fa-crown" style={{ color: 'var(--yellow)' }}></i> SUPER ADMIN EXECUTIVE INTELLIGENCE
          </div>
          <h1 className="executive-heading">
            Executive KPI & Performance Command
          </h1>
          <p className="executive-subheading">
            Real-time revenue metrics, fleet utilization velocity, multi-branch ledgers & executive reporting.
          </p>
        </div>

        {/* PERIOD CONTROLS & REPORT ACTIONS */}
        <div className="executive-controls-panel">
          {/* Period Pills: Day | Month | Year | All */}
          <div className="period-pills-group">
            <button 
              type="button" 
              className={`period-pill-btn ${period === 'day' ? 'active' : ''}`}
              onClick={() => setPeriod('day')}
            >
              <i className="fa-regular fa-calendar-check"></i> Daily
            </button>
            <button 
              type="button" 
              className={`period-pill-btn ${period === 'month' ? 'active' : ''}`}
              onClick={() => setPeriod('month')}
            >
              <i className="fa-regular fa-calendar-days"></i> Monthly
            </button>
            <button 
              type="button" 
              className={`period-pill-btn ${period === 'year' ? 'active' : ''}`}
              onClick={() => setPeriod('year')}
            >
              <i className="fa-solid fa-calendar"></i> Yearly
            </button>
            <button 
              type="button" 
              className={`period-pill-btn ${period === 'all' ? 'active' : ''}`}
              onClick={() => setPeriod('all')}
            >
              <i className="fa-solid fa-infinity"></i> All Time
            </button>
          </div>

          {/* DYNAMIC DATE / MONTH / YEAR PICKER */}
          {period === 'day' && (
            <div className="period-picker-container">
              <label className="picker-label">Report Date:</label>
              <input 
                type="date" 
                className="form-input picker-input" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
              />
            </div>
          )}

          {period === 'month' && (
            <div className="period-picker-container">
              <label className="picker-label">Report Month:</label>
              <input 
                type="month" 
                className="form-input picker-input" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
              />
            </div>
          )}

          {period === 'year' && (
            <div className="period-picker-container">
              <label className="picker-label">Report Year:</label>
              <select 
                className="form-input picker-input" 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="report-action-buttons">
            <button 
              type="button" 
              className="btn-report-generate"
              onClick={() => setIsReportModalOpen(true)}
              title="Generate printable executive report document"
            >
              <i className="fa-solid fa-file-invoice"></i> Get Report
            </button>
            <button 
              type="button" 
              className="btn-report-export"
              onClick={handleExportCSV}
              title="Download CSV report for current timeframe"
            >
              <i className="fa-solid fa-file-arrow-down"></i> Export CSV
            </button>
            <button 
              type="button" 
              className="btn-report-refresh"
              onClick={loadExecutiveData}
              title="Refresh Analytics"
            >
              <i className={`fa-solid fa-arrows-rotate ${loading ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE REPORT BANNER */}
      <div className="report-period-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="pulse-indicator"></span>
          <span style={{ fontWeight: 700, color: '#fff' }}>
            Current Focus: <span style={{ color: 'var(--yellow)' }}>{analytics?.periodLabel || 'All Time'}</span>
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            ({ledger.length} transactions recorded in timeframe)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
          <span>Settled: <strong style={{ color: '#34d399' }}>LKR {Number(summary.settledRevenue).toLocaleString()}</strong></span>
          <span>Fines: <strong style={{ color: '#f87171' }}>LKR {Number(summary.totalFines).toLocaleString()}</strong></span>
          <span>Fleet Utilization: <strong style={{ color: 'var(--yellow)' }}>{realtime.utilizationRate}%</strong></span>
        </div>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '20px' }}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* ========================================================
          2. PRIMARY EXECUTIVE KPI MATRIX
          ======================================================== */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {/* KPI 1: Settled Revenue */}
        <div className="stat-card executive-kpi-card" onClick={() => onNavigate('payments')}>
          <div className="kpi-card-header">
            <div>
              <div className="stat-title">Period Settled Revenue</div>
              <div className="stat-value" style={{ color: '#34d399', fontSize: '1.95rem' }}>
                LKR {Number(summary.settledRevenue).toLocaleString()}
              </div>
            </div>
            <div className="kpi-icon-pill" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-sack-dollar"></i>
            </div>
          </div>
          <div className="kpi-meta-row">
            <span>Avg Ticket: <strong>LKR {Number(summary.averageRentalValue).toLocaleString()}</strong></span>
            <span>Fines: <strong style={{ color: '#f87171' }}>+{Number(summary.totalFines).toLocaleString()}</strong></span>
          </div>
          <div className="kpi-db-tag">
            <i className="fa-solid fa-circle-check"></i> Reconciled Across {summary.totalRentals} Transactions
          </div>
        </div>

        {/* KPI 2: Fleet Utilization Rate */}
        <div className="stat-card executive-kpi-card" onClick={() => onNavigate('fleet')}>
          <div className="kpi-card-header">
            <div>
              <div className="stat-title">Fleet Utilization Rate</div>
              <div className="stat-value" style={{ color: 'var(--yellow)', fontSize: '1.95rem' }}>
                {realtime.utilizationRate}%
              </div>
            </div>
            <div className="kpi-icon-pill" style={{ background: 'rgba(245, 197, 24, 0.15)', color: 'var(--yellow)' }}>
              <i className="fa-solid fa-gauge-high"></i>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="kpi-progress-bar-bg">
            <div 
              className="kpi-progress-bar-fill" 
              style={{ width: `${Math.min(realtime.utilizationRate, 100)}%` }}
            ></div>
          </div>
          <div className="kpi-meta-row">
            <span>{realtime.ongoingRentals} in Active Service</span>
            <span>{realtime.totalVehicles} Total Fleet Assets</span>
          </div>
          <div className="kpi-db-tag">
            <i className="fa-solid fa-chart-pie"></i> Real-Time Active Fleet Ratio
          </div>
        </div>

        {/* KPI 3: Available Fleet */}
        <div className="stat-card executive-kpi-card" onClick={() => onNavigate('fleet')}>
          <div className="kpi-card-header">
            <div>
              <div className="stat-title">Available Fleet Ready</div>
              <div className="stat-value" style={{ color: '#60a5fa', fontSize: '1.95rem' }}>
                {realtime.availableVehicles}
              </div>
            </div>
            <div className="kpi-icon-pill" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa' }}>
              <i className="fa-solid fa-car-side"></i>
            </div>
          </div>
          <div className="kpi-meta-row">
            <span>Ready for Immediate Deployment</span>
            <span style={{ color: '#34d399' }}>● Operational</span>
          </div>
          <div className="kpi-db-tag">
            <i className="fa-solid fa-shield-halved"></i> Inspected & Ready for Immediate Hire
          </div>
        </div>

        {/* KPI 4: In Maintenance */}
        <div className="stat-card executive-kpi-card" onClick={() => onNavigate('maintenance')}>
          <div className="kpi-card-header">
            <div>
              <div className="stat-title">Undergoing Maintenance</div>
              <div className="stat-value" style={{ color: '#f59e0b', fontSize: '1.95rem' }}>
                {realtime.inMaintenance}
              </div>
            </div>
            <div className="kpi-icon-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
          </div>
          <div className="kpi-meta-row">
            <span>Active workshop service jobs</span>
            <span style={{ color: '#f59e0b' }}>Scheduled / In Progress</span>
          </div>
          <div className="kpi-db-tag">
            <i className="fa-solid fa-screwdriver-wrench"></i> Servicing & Scheduled Safety Inspections
          </div>
        </div>
      </div>

      {/* ========================================================
          3. VISUAL INTERACTIVE GRAPHS SECTION
          ======================================================== */}
      <div className="dashboard-grid-2" style={{ marginBottom: '24px' }}>
        {/* GRAPH 1: REVENUE & VOLUME VELOCITY CURVE */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <i className="fa-solid fa-chart-line" style={{ color: 'var(--yellow)', marginRight: '6px' }}></i>
                Revenue & Velocity Progression
              </div>
              <div className="chart-subtitle">
                {period === 'day' ? '14-Day Velocity Progression' :
                 period === 'month' ? `Daily Performance for ${selectedMonth}` :
                 period === 'year' ? `Monthly Performance for Year ${selectedYear}` :
                 'All-Time Historical Progression'}
              </div>
            </div>
            <div className="chart-metric-toggle">
              <button 
                type="button" 
                className={`chart-toggle-btn ${chartMetric === 'revenue' ? 'active' : ''}`}
                onClick={() => setChartMetric('revenue')}
              >
                Revenue (LKR)
              </button>
              <button 
                type="button" 
                className={`chart-toggle-btn ${chartMetric === 'volume' ? 'active' : ''}`}
                onClick={() => setChartMetric('volume')}
              >
                Rental Volume
              </button>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="svg-chart-container">
            <InteractiveSvgCurve 
              data={timeSeries} 
              metric={chartMetric}
              hoveredPoint={hoveredPoint}
              onHover={setHoveredPoint}
            />
          </div>

          <div className="chart-footer-metrics">
            <div className="metric-chip">
              <span className="chip-label">Total Points</span>
              <span className="chip-value">{timeSeries.length} nodes</span>
            </div>
            <div className="metric-chip">
              <span className="chip-label">Period Peak</span>
              <span className="chip-value" style={{ color: 'var(--yellow)' }}>
                {chartMetric === 'revenue' 
                  ? `LKR ${Math.max(...timeSeries.map(d => Number(d.revenue) || 0), 0).toLocaleString()}`
                  : `${Math.max(...timeSeries.map(d => Number(d.rentalCount) || 0), 0)} rentals`
                }
              </span>
            </div>
            <div className="metric-chip">
              <span className="chip-label">Aggregate Settled</span>
              <span className="chip-value" style={{ color: '#34d399' }}>
                LKR {Number(summary.settledRevenue).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* GRAPH 2: BRANCH PERFORMANCE COMPARISON */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <i className="fa-solid fa-sitemap" style={{ color: 'var(--yellow)', marginRight: '6px' }}></i>
                Hub Performance & Revenue Share
              </div>
              <div className="chart-subtitle">
                Cross-branch contribution across Sri Lanka's 4 strategic centers
              </div>
            </div>
            <span className="badge" style={{ background: 'rgba(245, 197, 24, 0.1)', color: 'var(--yellow)' }}>
              All Strategic Hubs
            </span>
          </div>

          <div className="branch-bars-list">
            {branchBreakdown.map((b) => {
              const maxRev = Math.max(...branchBreakdown.map(x => Number(x.TotalRevenue) || 1), 1);
              const totalAllRev = branchBreakdown.reduce((acc, curr) => acc + Number(curr.TotalRevenue || 0), 0) || 1;
              const revPercent = ((Number(b.TotalRevenue) / totalAllRev) * 100).toFixed(1);
              const barWidth = Math.max(((Number(b.TotalRevenue) / maxRev) * 100), 4);

              return (
                <div key={b.BranchID} className="branch-bar-item">
                  <div className="branch-bar-meta">
                    <div className="branch-bar-title">
                      <i className="fa-solid fa-location-dot" style={{ color: 'var(--yellow)', marginRight: '6px' }}></i>
                      <strong>{b.BranchName}</strong>
                      <span className="branch-location-text">({b.Location.split(',')[0]})</span>
                    </div>
                    <div className="branch-bar-figures">
                      <span style={{ fontWeight: 800, color: '#34d399' }}>
                        LKR {Number(b.TotalRevenue).toLocaleString()}
                      </span>
                      <span className="branch-share-tag">{revPercent}%</span>
                    </div>
                  </div>
                  <div className="branch-progress-track">
                    <div 
                      className="branch-progress-fill" 
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                  <div className="branch-bar-sub">
                    <span>Fleet: <strong>{b.FleetCount} Vehicles</strong></span>
                    <span>Bookings: <strong>{b.TotalBookings}</strong></span>
                    <span>Settled Rentals: <strong>{b.TotalRentals}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. SECONDARY INSIGHTS & DISTRIBUTION SECTION
          ======================================================== */}
      <div className="dashboard-grid-3" style={{ marginBottom: '28px' }}>
        {/* Category Revenue Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <i className="fa-solid fa-layer-group" style={{ color: 'var(--yellow)', marginRight: '6px' }}></i>
                Category Yield & Fleet Size
              </div>
              <div className="chart-subtitle">Revenue generated by category</div>
            </div>
          </div>
          <div className="category-rank-list">
            {categoryBreakdown.map((cat, idx) => (
              <div key={cat.CategoryID} className="category-rank-row">
                <div className="category-rank-left">
                  <div className="rank-num">#{idx + 1}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{cat.CategoryName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Rate: LKR {Number(cat.DailyRate).toLocaleString()} / day • {cat.VehicleCount} Assets
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.9rem' }}>
                    LKR {Number(cat.TotalRevenue).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {cat.TotalBookings} bookings
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Status Donut & Health */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <i className="fa-solid fa-shield-halved" style={{ color: 'var(--yellow)', marginRight: '6px' }}></i>
                Fleet Status Distribution
              </div>
              <div className="chart-subtitle">Asset readiness & service state</div>
            </div>
          </div>
          <div className="fleet-status-visual-grid">
            {fleetStatus.map((s) => {
              const statusName = s.Status;
              const isAvail = statusName === 'Available';
              const isRented = statusName === 'Rented';
              const isMaint = statusName.includes('Maintenance');
              const color = isAvail ? '#10b981' : isRented ? '#f5c518' : isMaint ? '#f97316' : '#ef4444';

              return (
                <div key={s.Status} className="status-metric-box">
                  <div className="status-box-header">
                    <span className="status-color-dot" style={{ background: color }}></span>
                    <span className="status-box-name">{statusName.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="status-box-val" style={{ color }}>{s.count}</div>
                  <div className="status-box-percent">
                    {((s.count / (realtime.totalVehicles || 1)) * 100).toFixed(0)}% of Fleet
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Audit Trail Stream */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <i className="fa-solid fa-fingerprint" style={{ color: 'var(--yellow)', marginRight: '6px' }}></i>
                Real-Time Security & Activity Logs
              </div>
              <div className="chart-subtitle">Immutable system audit trail entries</div>
            </div>
            <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>
              Live Activity Stream
            </span>
          </div>

          <div className="audit-logs-stream">
            {auditLogs.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', padding: '12px' }}>
                No recent security activities logged.
              </div>
            ) : (
              auditLogs.slice(0, 5).map((log) => (
                <div key={log.LogID} className="audit-stream-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className={`audit-badge badge-${(log.ActionType || '').toLowerCase()}`}>
                      {log.ActionType}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {log.ActionTimestamp ? new Date(log.ActionTimestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>
                  <div className="audit-desc-text">
                    {log.Description || `Modified ${log.TableName} (ID #${log.RecordID})`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          5. EXECUTIVE REPORT MODAL (PRINT, VIEW, PDF & CSV)
          ======================================================== */}
      {isReportModalOpen && (
        <ExecutiveReportModal 
          analytics={analytics}
          period={period}
          onClose={() => setIsReportModalOpen(false)}
          onExportCSV={handleExportCSV}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: INTERACTIVE SVG CURVE / AREA CHART
// -------------------------------------------------------------
function InteractiveSvgCurve({ data = [], metric = 'revenue', hoveredPoint, onHover }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty-state">
        <i className="fa-solid fa-chart-area" style={{ fontSize: '28px', color: 'var(--text-dim)', marginBottom: '8px' }}></i>
        <div>No recorded rental transactions for this reporting window.</div>
        <small style={{ color: 'var(--text-muted)' }}>Select another period or date above.</small>
      </div>
    );
  }

  // Width, Height & Padding
  const width = 640;
  const height = 200;
  const paddingX = 45;
  const paddingY = 30;

  // Extract values
  const values = data.map(d => metric === 'revenue' ? Number(d.revenue) : Number(d.rentalCount));
  const maxVal = Math.max(...values, metric === 'revenue' ? 10000 : 1);
  const minVal = 0;

  // Normalized coordinate points
  const points = data.map((d, i) => {
    const x = data.length === 1 
      ? width / 2 
      : paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
    const val = metric === 'revenue' ? Number(d.revenue) : Number(d.rentalCount);
    const y = height - paddingY - (val / maxVal) * (height - 2 * paddingY);
    return { x, y, data: d, val };
  });

  // Construct SVG Path
  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="executive-svg-element"
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5c518" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#f5c518" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#f5c518" stopOpacity="0.0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - paddingY - ratio * (height - 2 * paddingY);
          const gridVal = metric === 'revenue' 
            ? `${(Math.round((ratio * maxVal) / 1000))}k`
            : `${Math.round(ratio * maxVal)}`;
          return (
            <g key={ratio}>
              <line 
                x1={paddingX} 
                y1={y} 
                x2={width - paddingX} 
                y2={y} 
                stroke="rgba(255,255,255,0.06)" 
                strokeDasharray="4 4" 
              />
              <text 
                x={paddingX - 8} 
                y={y + 4} 
                fill="var(--text-muted)" 
                fontSize="10" 
                textAnchor="end"
              >
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#curveGradient)" />

        {/* Stroke Line */}
        <path 
          d={linePath} 
          fill="none" 
          stroke="#f5c518" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Data Points */}
        {points.map((p, idx) => {
          const isHovered = hoveredPoint?.data?.label === p.data.label;
          return (
            <g key={idx} style={{ cursor: 'pointer' }}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={isHovered ? 7 : 4} 
                fill={isHovered ? '#fff' : '#f5c518'} 
                stroke="#000" 
                strokeWidth={isHovered ? 2.5 : 1.5}
                filter={isHovered ? 'url(#glow)' : undefined}
                onMouseEnter={() => onHover(p)}
                onMouseLeave={() => onHover(null)}
              />
              {/* X axis labels (sample) */}
              {(points.length <= 8 || idx % Math.ceil(points.length / 8) === 0) && (
                <text 
                  x={p.x} 
                  y={height - 10} 
                  fill="var(--text-muted)" 
                  fontSize="10" 
                  textAnchor="middle"
                >
                  {p.data.label ? p.data.label.slice(-5) : ''}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* FLOATING TOOLTIP */}
      {hoveredPoint && (
        <div 
          className="chart-tooltip-floating"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100}%`
          }}
        >
          <div className="tooltip-header">{hoveredPoint.data.label}</div>
          <div className="tooltip-body">
            <div>Revenue: <strong style={{ color: '#34d399' }}>LKR {Number(hoveredPoint.data.revenue).toLocaleString()}</strong></div>
            <div>Rentals: <strong style={{ color: 'var(--yellow)' }}>{hoveredPoint.data.rentalCount} bookings</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: EXECUTIVE REPORT MODAL (PRINT & CSV READY)
// -------------------------------------------------------------
function ExecutiveReportModal({ analytics, period, onClose, onExportCSV, currentUser }) {
  const summary = analytics?.summary || {};
  const realtime = analytics?.realtime || {};
  const ledger = analytics?.ledger || [];
  const branchBreakdown = analytics?.branchBreakdown || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content executive-report-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* REPORT MODAL TOP BAR (Hidden when printed) */}
        <div className="modal-header report-modal-header no-print">
          <div>
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-file-contract" style={{ color: 'var(--yellow)' }}></i>
              Official Executive Performance & Audit Report
            </h3>
            <div className="modal-subtitle">
              Ready for executive presentation, PDF printing, and spreadsheet auditing
            </div>
          </div>
          <div className="report-modal-actions">
            <button 
              type="button" 
              className="btn-modal-print" 
              onClick={handlePrint}
            >
              <i className="fa-solid fa-print"></i> Print / Save PDF
            </button>
            <button 
              type="button" 
              className="btn-modal-csv" 
              onClick={onExportCSV}
            >
              <i className="fa-solid fa-file-arrow-down"></i> Download CSV
            </button>
            <button 
              type="button"
              className="modal-close-pill" 
              onClick={onClose}
              title="Close Report"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT CONTAINER */}
        <div className="printable-report-document" id="printable-report">
          {/* Document Letterhead */}
          <div className="report-letterhead">
            <div className="letterhead-brand">
              <div className="letterhead-logo">
                <i className="fa-solid fa-car-burst"></i> RENTO
              </div>
              <div className="letterhead-tagline">Mobility Solutions & Luxury Fleet Logistics (Pvt) Ltd</div>
              <div className="letterhead-address">45 Galle Road, Colombo 03, Sri Lanka • support@rento.lk</div>
            </div>
            <div className="letterhead-meta">
              <div className="doc-classification">CONFIDENTIAL • SUPER ADMIN</div>
              <div className="doc-title-main">EXECUTIVE PERFORMANCE AUDIT</div>
              <div className="doc-info-row">
                <span>Period Focus:</span> <strong>{analytics?.periodLabel || period.toUpperCase()}</strong>
              </div>
              <div className="doc-info-row">
                <span>Generated On:</span> <strong>{new Date().toLocaleString()}</strong>
              </div>
              <div className="doc-info-row">
                <span>Authorized Signatory:</span> <strong>{currentUser?.Username || 'admin_super'}</strong>
              </div>
            </div>
          </div>

          <div className="report-divider"></div>

          {/* Executive Summary Metrics Grid */}
          <div className="report-section-title">1. Executive Summary & Financial Highlights</div>
          <div className="report-kpi-table-grid">
            <div className="report-kpi-box">
              <div className="report-kpi-label">Settled Rental Revenue</div>
              <div className="report-kpi-val" style={{ color: '#059669' }}>
                LKR {Number(summary.settledRevenue || 0).toLocaleString()}
              </div>
              <div className="report-kpi-sub">Across {summary.totalRentals || 0} completed rentals</div>
            </div>
            <div className="report-kpi-box">
              <div className="report-kpi-label">Fines Recovered</div>
              <div className="report-kpi-val" style={{ color: '#dc2626' }}>
                LKR {Number(summary.totalFines || 0).toLocaleString()}
              </div>
              <div className="report-kpi-sub">{summary.fineCount || 0} fine notices issued</div>
            </div>
            <div className="report-kpi-box">
              <div className="report-kpi-label">Fleet Asset Utilization</div>
              <div className="report-kpi-val" style={{ color: '#d97706' }}>
                {realtime.utilizationRate || 0}%
              </div>
              <div className="report-kpi-sub">{realtime.totalVehicles || 0} total fleet capacity</div>
            </div>
            <div className="report-kpi-box">
              <div className="report-kpi-label">Average Ticket Size</div>
              <div className="report-kpi-val">
                LKR {Number(summary.averageRentalValue || 0).toLocaleString()}
              </div>
              <div className="report-kpi-sub">Net yield per active transaction</div>
            </div>
          </div>

          {/* Hub Breakdown Table */}
          <div className="report-section-title" style={{ marginTop: '20px' }}>2. Strategic Branch Hub Contribution</div>
          <table className="report-document-table">
            <thead>
              <tr>
                <th>Branch Hub</th>
                <th>Location</th>
                <th>Fleet Assigned</th>
                <th>Bookings</th>
                <th>Completed Rentals</th>
                <th style={{ textAlign: 'right' }}>Revenue Generated (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {branchBreakdown.map((b) => (
                <tr key={b.BranchID}>
                  <td><strong>{b.BranchName}</strong></td>
                  <td>{b.Location}</td>
                  <td>{b.FleetCount} Vehicles</td>
                  <td>{b.TotalBookings}</td>
                  <td>{b.TotalRentals}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    LKR {Number(b.TotalRevenue).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Transaction Ledger Table */}
          <div className="report-section-title" style={{ marginTop: '24px' }}>
            3. Period Transaction Ledger ({ledger.length} Record{ledger.length === 1 ? '' : 's'})
          </div>
          <table className="report-document-table ledger-table">
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Customer</th>
                <th>Vehicle & Hub</th>
                <th>Category</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Fines</th>
                <th style={{ textAlign: 'right' }}>Amount Settled</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
                    No rental transactions recorded within the chosen timeframe.
                  </td>
                </tr>
              ) : (
                ledger.map((item) => (
                  <tr key={item.RentalID}>
                    <td><strong>#RNT-{item.RentalID}</strong></td>
                    <td>
                      <div><strong>{item.CustomerName}</strong></div>
                      <small style={{ color: '#666' }}>{item.CustomerPhone}</small>
                    </td>
                    <td>
                      <div>{item.VehicleInfo}</div>
                      <small style={{ color: '#888' }}>{item.BranchName}</small>
                    </td>
                    <td>{item.CategoryName}</td>
                    <td style={{ fontSize: '11px' }}>
                      {item.ActualStartDate ? item.ActualStartDate.split('T')[0] : 'N/A'} → {item.ActualEndDate ? item.ActualEndDate.split('T')[0] : 'Present'}
                    </td>
                    <td>
                      <span className={`report-status-pill pill-${(item.RentalStatus || '').toLowerCase()}`}>
                        {item.RentalStatus}
                      </span>
                    </td>
                    <td style={{ color: Number(item.TotalFines) > 0 ? '#dc2626' : '#666' }}>
                      {Number(item.TotalFines) > 0 ? `LKR ${Number(item.TotalFines).toLocaleString()}` : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      LKR {Number(item.Amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Document Sign-off / Verification Seal */}
          <div className="report-signoff-block">
            <div className="signoff-signature">
              <div className="signature-line"></div>
              <div className="signoff-name">Super Administrator</div>
              <div className="signoff-role">Head of Mobility Operations • RENTO System Authority</div>
            </div>
            <div className="signoff-seal">
              <div className="seal-badge">
                <i className="fa-solid fa-stamp"></i> EXECUTIVE AUDIT VERIFIED
              </div>
              <div className="seal-text">Verified against System Transaction Ledgers & Financial Audits</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
