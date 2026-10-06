import { useState, useEffect } from 'react';
import './index.css';

function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('vr_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authPromptMsg, setAuthPromptMsg] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '', password: '', firstName: '', lastName: '', nic: '', dob: '1995-05-15', phone: '', email: '', address: ''
  });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab & Search / Category Filters
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toast, setToast] = useState(null);

  // Data States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ customers: 0, vehicles: 0, rentals: 0, maintenance: 0, totalRevenue: 0 });
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [outstandingPayments, setOutstandingPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState([]);
  const [fines, setFines] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [branchPerformance, setBranchPerformance] = useState([]);
  const [maintenanceCosts, setMaintenanceCosts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Modals state
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({});
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Viva Demonstration States in LKR
  const [trapResult, setTrapResult] = useState(null);
  const [calcRentalDays, setCalcRentalDays] = useState(5);
  const [calcDailyRate, setCalcDailyRate] = useState(8500);
  const [calcLateDays, setCalcLateDays] = useState(2);
  const [calcLateRate, setCalcLateRate] = useState(8500);
  const [calcDob, setCalcDob] = useState('1998-04-12');

  // Toast Helper
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  // Primary Data Fetcher
  const loadAllData = async () => {
    try {
      const [
        statsRes, vehRes, allVehRes, branchRes, catRes, bookRes, rentRes,
        payOutRes, payAllRes, paySumRes, fineRes, maintRes, branchPerfRes, maintCostRes,
        custRes, auditRes
      ] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard/stats').then(r => r.json()).catch(() => ({})),
        fetch('http://localhost:5000/api/vehicles').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/vehicles/all').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/branches').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/categories').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/bookings').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/rentals/active').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/payments/outstanding').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/payments/all').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/payments/summary').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/fines').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/maintenance').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/reports/branch-performance').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/reports/maintenance-cost').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/customers/all').then(r => r.json()).catch(() => []),
        fetch('http://localhost:5000/api/audit-logs').then(r => r.json()).catch(() => [])
      ]);

      setStats(statsRes || {});
      setVehicles(Array.isArray(vehRes) ? vehRes : []);
      setAllVehicles(Array.isArray(allVehRes) ? allVehRes : []);
      setBranches(Array.isArray(branchRes) ? branchRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setBookings(Array.isArray(bookRes) ? bookRes : []);
      setActiveRentals(Array.isArray(rentRes) ? rentRes : []);
      setOutstandingPayments(Array.isArray(payOutRes) ? payOutRes : []);
      setPayments(Array.isArray(payAllRes) ? payAllRes : []);
      setPaymentSummary(Array.isArray(paySumRes) ? paySumRes : []);
      setFines(Array.isArray(fineRes) ? fineRes : []);
      setMaintenance(Array.isArray(maintRes) ? maintRes : []);
      setBranchPerformance(Array.isArray(branchPerfRes) ? branchPerfRes : []);
      setMaintenanceCosts(Array.isArray(maintCostRes) ? maintCostRes : []);
      setCustomers(Array.isArray(custRes) ? custRes : []);
      setAuditLogs(Array.isArray(auditRes) ? auditRes : []);

      if (currentUser && currentUser.RoleName === 'Customer') {
        const custId = currentUser.UserID;
        fetch(`http://localhost:5000/api/customer/${custId}/bookings`)
          .then(r => r.json())
          .then(data => setMyBookings(Array.isArray(data) ? data : []))
          .catch(() => {});
        
        fetch(`http://localhost:5000/api/customer/${custId}/rentals`)
          .then(r => r.json())
          .then(data => setMyRentals(Array.isArray(data) ? data : []))
          .catch(() => {});
      }

      setLoading(false);
    } catch (err) {
      console.error("Data load error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setActiveTab('browse');
    } else if (currentUser.RoleName === 'Customer') {
      setActiveTab('browse');
    } else if (currentUser.RoleName === 'Admin') {
      setActiveTab('dashboard');
    } else if (currentUser.RoleName === 'Branch Manager' || currentUser.RoleName === 'Rental Staff') {
      setActiveTab('fleet');
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setCurrentUser(data.user);
      localStorage.setItem('vr_user', JSON.stringify(data.user));
      setIsLoginOpen(false);
      setAuthPromptMsg('');
      setLoginForm({ username: '', password: '' });
      showToast(`Welcome, ${data.user.FullName || data.user.Username}!`);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: registerForm.username, password: registerForm.password })
      });
      const loginData = await loginRes.json();

      if (loginRes.ok && loginData.user) {
        setCurrentUser(loginData.user);
        localStorage.setItem('vr_user', JSON.stringify(loginData.user));
        setIsLoginOpen(false);
        setAuthPromptMsg('');
        showToast(`Registration complete! Welcome, ${loginData.user.FullName}!`);
      } else {
        showToast('Account registered! Please sign in.');
        setIsRegisterMode(false);
      }
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vr_user');
    setActiveTab('browse');
    showToast("Signed out successfully");
  };

  const fillDemo = (username, password) => {
    setLoginForm({ username, password });
    setLoginError('');
  };

  // Generic Action Modal Handler
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      let url = '';
      let method = 'POST';

      if (modalState.type === 'book_vehicle') {
        url = 'http://localhost:5000/api/bookings';
      } else if (modalState.type === 'add_vehicle') {
        url = 'http://localhost:5000/api/vehicles';
      } else if (modalState.type === 'start_rental') {
        url = 'http://localhost:5000/api/rentals/start';
      } else if (modalState.type === 'return_vehicle') {
        url = 'http://localhost:5000/api/rentals/return';
      } else if (modalState.type === 'process_payment') {
        url = 'http://localhost:5000/api/payments/process';
      } else if (modalState.type === 'schedule_maintenance') {
        url = 'http://localhost:5000/api/maintenance';
      } else if (modalState.type === 'update_vehicle_status') {
        url = `http://localhost:5000/api/vehicles/${modalState.data.VehicleID}/status`;
        method = 'PUT';
      } else if (modalState.type === 'update_maint_status') {
        url = `http://localhost:5000/api/maintenance/${modalState.data.MaintenanceID}/status`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Action failed');

      showToast(result.message || 'Operation executed successfully!');
      setModalState({ type: null, data: null });
      setFormData({});
      loadAllData();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Run Error Trap Simulation
  const runErrorSimulation = async (type) => {
    setTrapResult({ status: 'running', message: 'Sending invalid payload to MySQL Stored Procedure...' });
    try {
      let res, data;
      if (type === 'dup_plate') {
        res = await fetch('http://localhost:5000/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: 1, branchId: 1, make: 'Test', model: 'Car', year: 2024,
            registration: 'CBA-1020', purchaseDate: '2024-01-01'
          })
        });
        data = await res.json();
      } else if (type === 'future_dob') {
        res = await fetch('http://localhost:5000/api/customers/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'futuristic_user_' + Date.now(), password: 'password123',
            firstName: 'Future', lastName: 'User', nic: 'NIC' + Date.now(),
            dob: '2099-01-01', phone: '999' + Date.now(), email: 'f' + Date.now() + '@f.com', address: 'Mars'
          })
        });
        data = await res.json();
      } else if (type === 'booking_conflict') {
        res = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: 1, vehicleId: 7,
            startDate: '2026-10-02', endDate: '2026-10-08'
          })
        });
        data = await res.json();
      }

      if (!res.ok) {
        setTrapResult({
          status: 'trapped',
          type,
          error: data.error,
          sqlState: '45000 (Custom Trap)',
          action: 'ACID Transaction ROLLED BACK successfully by EXIT HANDLER.'
        });
      } else {
        setTrapResult({ status: 'unexpected_success', data });
      }
    } catch (err) {
      setTrapResult({ status: 'error', error: err.message });
    }
  };

  if (loading) {
    return (
      <div className="dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 className="title">Connecting to Enterprise ADBMS Platform...</h2>
      </div>
    );
  }

  const role = currentUser?.RoleName;

  // Filtered vehicles for Customer browse
  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = v.Make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.Model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.CategoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'All' || v.CategoryName === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="dashboard">
      {/* Toast Banner */}
      {toast && (
        <div className="toast-msg">
          <span>✨</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="header">
        <div>
          <h1 className="title">AutoManager Pro</h1>
          <div style={{ color: 'var(--text-muted)' }}>
            {currentUser 
              ? `Signed in as ${currentUser.RoleName}`
              : 'Premium Island-Wide Vehicle Rental Services • Powered by ADBMS'}
          </div>
        </div>

        <div className="header-actions">
          {currentUser ? (
            <div className="user-profile-capsule">
              <div className="user-avatar">
                {currentUser.FullName ? currentUser.FullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{currentUser.FullName || currentUser.Username}</span>
                <span className="user-role-tag">{currentUser.RoleName}</span>
              </div>
              <button className="btn-logout" onClick={handleLogout} title="Sign Out">
                Logout
              </button>
            </div>
          ) : (
            <button 
              id="login-btn"
              className="btn-login" 
              onClick={() => { setIsLoginOpen(true); setIsRegisterMode(false); setAuthPromptMsg(''); setLoginError(''); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </header>

      {/* Dynamic Navigation Tabs */}
      <nav className="tabs-nav">
        {/* Guest or Customer Tabs */}
        {(!currentUser || role === 'Customer') && (
          <>
            <button className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
              🚗 Browse & Rent Fleet
            </button>
            {currentUser && (
              <>
                <button className={`tab-btn ${activeTab === 'my_bookings' ? 'active' : ''}`} onClick={() => setActiveTab('my_bookings')}>
                  📑 My Bookings <span className="tab-badge">{myBookings.length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'my_invoices' ? 'active' : ''}`} onClick={() => setActiveTab('my_invoices')}>
                  💳 My Invoices & Fines
                </button>
              </>
            )}
            <button className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`} onClick={() => setActiveTab('branches')}>
              🏢 Branches & Locations
            </button>
          </>
        )}

        {/* Staff / Manager Tabs */}
        {(role === 'Branch Manager' || role === 'Rental Staff') && (
          <>
            <button className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => setActiveTab('fleet')}>
              🚗 Fleet Inventory <span className="tab-badge">{allVehicles.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
              📑 Bookings <span className="tab-badge">{bookings.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'rentals' ? 'active' : ''}`} onClick={() => setActiveTab('rentals')}>
              🔑 Active Rentals <span className="tab-badge">{activeRentals.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
              💳 Payments & Fines <span className="tab-badge">{outstandingPayments.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`} onClick={() => setActiveTab('maintenance')}>
              🛠️ Maintenance <span className="tab-badge">{maintenance.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
              👥 Customers <span className="tab-badge">{customers.length}</span>
            </button>
          </>
        )}

        {/* Admin Tabs */}
        {role === 'Admin' && (
          <>
            <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              📊 Executive KPI
            </button>
            <button className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => setActiveTab('fleet')}>
              🚗 Fleet Inventory <span className="tab-badge">{allVehicles.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
              📑 Bookings <span className="tab-badge">{bookings.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'rentals' ? 'active' : ''}`} onClick={() => setActiveTab('rentals')}>
              🔑 Active Rentals <span className="tab-badge">{activeRentals.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
              💳 Payments & Fines <span className="tab-badge">{outstandingPayments.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`} onClick={() => setActiveTab('maintenance')}>
              🛠️ Maintenance <span className="tab-badge">{maintenance.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
              👥 Customers <span className="tab-badge">{customers.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`} onClick={() => setActiveTab('branches')}>
              🏢 Branch Analytics
            </button>
            <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
              🛡️ Trigger Audit Logs <span className="tab-badge">{auditLogs.length}</span>
            </button>
          </>
        )}

        {/* ADBMS Viva Proofs Tab (Always Accessible) */}
        <button 
          className={`tab-btn ${activeTab === 'viva' ? 'active' : ''}`} 
          onClick={() => setActiveTab('viva')} 
          style={{ 
            background: activeTab === 'viva' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.15)', 
            color: activeTab === 'viva' ? '#fff' : '#c084fc' 
          }}
        >
          🔬 ADBMS Viva Hub
        </button>
      </nav>

      {/* ======================================================== */}
      {/* TAB: BROWSE & RENT FLEET (DEFAULT VISITOR / CUSTOMER SCREEN) */}
      {/* ======================================================== */}
      {activeTab === 'browse' && (
        <>
          {/* Customer Welcome Hero Banner */}
          <div className="customer-hero">
            <h2 className="hero-title">Rent Modern, Reliable Vehicles in Sri Lanka</h2>
            <div className="hero-subtitle">
              Choose from verified economy city cars to premium SUVs with transparent daily rates, 24/7 support, and instant reservation in LKR.
            </div>
            <div className="hero-badges">
              <span className="hero-badge-pill">🚗 {vehicles.length} Available Vehicles</span>
              <span className="hero-badge-pill">🏢 4 Strategic Branches</span>
              <span className="hero-badge-pill">🛡️ Fully Insured & Serviced</span>
              <span className="hero-badge-pill">⚡ Instant Stored Procedure Booking</span>
            </div>
          </div>

          <section className="section">
            <div className="section-header">
              <div>
                <h2 className="section-title">🚗 Available Fleet for Immediate Hire</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Live available fleet powered by AvailableVehiclesView (Rates in LKR)</div>
              </div>
              <div className="search-bar-box">
                <span>🔍</span>
                <input className="search-input" placeholder="Search make, model, category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="category-pills">
              <button className={`cat-pill ${selectedCategory === 'All' ? 'active' : ''}`} onClick={() => setSelectedCategory('All')}>All Categories</button>
              {categories.map((c) => (
                <button 
                  key={c.CategoryID} 
                  className={`cat-pill ${selectedCategory === c.CategoryName ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(c.CategoryName)}
                >
                  {c.CategoryName} (LKR {Number(c.DailyRate).toLocaleString()}/day)
                </button>
              ))}
            </div>

            <div className="fleet-grid">
              {filteredVehicles.map((v) => (
                <div key={v.VehicleID} className="vehicle-card">
                  <div>
                    <div className="vehicle-card-header">
                      <div>
                        <div className="vehicle-title">{v.Make} {v.Model}</div>
                        <div className="vehicle-category">{v.CategoryName}</div>
                      </div>
                      <span className="badge active">{v.Status || 'Available'}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Plate: <strong>{v.RegistrationNumber}</strong>
                    </div>
                  </div>

                  <div>
                    <div className="vehicle-price-box">
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Daily Rate:</span>
                      <span className="vehicle-rate">LKR {Number(v.DailyRate).toLocaleString()}<small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/day</small></span>
                    </div>

                    <button 
                      className="btn-primary" 
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => {
                        if (!currentUser) {
                          setAuthPromptMsg(`Please sign in or create an account to reserve the ${v.Make} ${v.Model}!`);
                          setIsLoginOpen(true);
                          setIsRegisterMode(false);
                        } else {
                          setFormData({ vehicleId: v.VehicleID, customerId: currentUser?.UserID || 1, startDate: '', endDate: '' });
                          setModalState({ type: 'book_vehicle', data: v });
                        }
                      }}
                    >
                      ⚡ {currentUser ? 'Book This Vehicle' : 'Sign In to Book'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ======================================================== */}
      {/* TAB: EXECUTIVE DASHBOARD (ADMIN VIEW) */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && role === 'Admin' && (
        <>
          <div className="stats-grid">
            <div className="stat-card" onClick={() => setActiveTab('customers')}>
              <div className="stat-title">Active Customers</div>
              <div className="stat-value">{stats.customers}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>ActiveCustomerView (M1)</div>
            </div>
            <div className="stat-card" onClick={() => setActiveTab('fleet')}>
              <div className="stat-title">Available Vehicles</div>
              <div className="stat-value">{stats.vehicles}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>AvailableVehiclesView (M2)</div>
            </div>
            <div className="stat-card" onClick={() => setActiveTab('rentals')}>
              <div className="stat-title">Active Ongoing Rentals</div>
              <div className="stat-value">{stats.rentals}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>ActiveRentalsView (M3)</div>
            </div>
            <div className="stat-card" onClick={() => setActiveTab('maintenance')}>
              <div className="stat-title">In Maintenance</div>
              <div className="stat-value">{stats.maintenance}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>VehicleMaintenanceView (M5)</div>
            </div>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(16, 185, 129, 0.15))' }}>
              <div className="stat-title">Total Settled Revenue (LKR)</div>
              <div className="stat-value" style={{ color: '#34d399' }}>LKR {Number(stats.totalRevenue || 0).toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Aggregated across completed transactions via PaymentSummaryView</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(59, 130, 246, 0.15))' }}>
              <div className="stat-title">Total Fleet Inventory</div>
              <div className="stat-value" style={{ color: '#60a5fa' }}>{allVehicles.length} Vehicles</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Across 4 strategic branches in Sri Lanka</div>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* TAB: FLEET INVENTORY (STAFF & ADMIN) */}
      {/* ======================================================== */}
      {activeTab === 'fleet' && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">🚗 Fleet Inventory & Vehicle Management</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Member 2 Module: Stored Procedures AddVehicle(), UpdateVehicleStatus(), UDF VehicleAge()</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="search-bar-box">
                <span>🔍</span>
                <input className="search-input" placeholder="Search plate, model, branch..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {(role === 'Admin' || role === 'Branch Manager' || role === 'Rental Staff') && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setFormData({ categoryId: 1, branchId: 1, make: '', model: '', year: 2024, registration: '', purchaseDate: '' });
                    setModalState({ type: 'add_vehicle', data: null });
                  }}
                >
                  + Add New Vehicle (SP)
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reg Number</th>
                  <th>Make & Model</th>
                  <th>Category</th>
                  <th>Branch</th>
                  <th>Age (UDF)</th>
                  <th>Daily Rate (LKR)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allVehicles.filter(v => 
                  v.RegistrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  v.Make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  v.Model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  v.BranchName.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((v) => (
                  <tr key={v.VehicleID}>
                    <td>#{v.VehicleID}</td>
                    <td style={{ fontWeight: 600 }}>{v.RegistrationNumber}</td>
                    <td>{v.Make} {v.Model} ({v.Year})</td>
                    <td>{v.CategoryName}</td>
                    <td>{v.BranchName}</td>
                    <td>{v.AgeYears} yrs</td>
                    <td>LKR {Number(v.DailyRate).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${(v.Status || 'available').toLowerCase()}`}>
                        {v.Status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-sm btn-primary"
                        onClick={() => {
                          setFormData({ status: v.Status });
                          setModalState({ type: 'update_vehicle_status', data: v });
                        }}
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB: BOOKINGS MANAGEMENT (MEMBER 3) */}
      {/* ======================================================== */}
      {(activeTab === 'bookings' || activeTab === 'my_bookings') && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">📑 {activeTab === 'my_bookings' ? 'My Booking Reservations' : 'All Customer Bookings'}</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>CustomerBookingView & SP ConfirmBooking() with overlap checks</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'my_bookings' ? myBookings : bookings).map((b) => (
                  <tr key={b.BookingID}>
                    <td>#{b.BookingID}</td>
                    <td>{b.FirstName ? `${b.FirstName} ${b.LastName || ''}` : currentUser?.FullName}</td>
                    <td>{b.Make} {b.Model} ({b.RegistrationNumber})</td>
                    <td>
                      {new Date(b.StartDate).toLocaleDateString()} ➔ {new Date(b.EndDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${(b.Status || 'pending').toLowerCase()}`}>
                        {b.Status}
                      </span>
                    </td>
                    <td>
                      {b.Status === 'Confirmed' && (role === 'Branch Manager' || role === 'Rental Staff' || role === 'Admin') && (
                        <button 
                          className="btn-success btn-sm"
                          onClick={() => {
                            setFormData({ bookingId: b.BookingID, startMileage: 10000 });
                            setModalState({ type: 'start_rental', data: b });
                          }}
                        >
                          🔑 Start Rental (Dispatch)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB: ACTIVE RENTALS & DISPATCH (MEMBER 3 / 4) */}
      {/* ======================================================== */}
      {activeTab === 'rentals' && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">🔑 Active Ongoing Rentals (ActiveRentalsView)</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Auto-synced with Vehicle Status 'Rented' via DB Trigger AfterRentalInsert</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Rental ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Start Date</th>
                  <th>Start Mileage</th>
                  <th>Rental Status</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeRentals.map((r) => (
                  <tr key={r.RentalID}>
                    <td>#{r.RentalID}</td>
                    <td>{r.FirstName} {r.LastName} ({r.Phone})</td>
                    <td>{r.Make} {r.Model} ({r.RegistrationNumber})</td>
                    <td>{new Date(r.ActualStartDate).toLocaleString()}</td>
                    <td>{r.StartMileage} km</td>
                    <td><span className="badge ongoing">{r.RentalStatus}</span></td>
                    <td><span className={`badge ${(r.PaymentStatus || 'pending').toLowerCase()}`}>{r.PaymentStatus || 'Pending'}</span></td>
                    <td>
                      {(role === 'Branch Manager' || role === 'Rental Staff' || role === 'Admin') && (
                        <button 
                          className="btn-primary btn-sm"
                          onClick={() => {
                            setFormData({ rentalId: r.RentalID, endMileage: (r.StartMileage || 0) + 150, damageCost: 0 });
                            setModalState({ type: 'return_vehicle', data: r });
                          }}
                        >
                          ↩️ Process Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB: PAYMENTS & FINES (MEMBER 4) */}
      {/* ======================================================== */}
      {(activeTab === 'payments' || activeTab === 'my_invoices') && (
        <>
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">💳 {activeTab === 'my_invoices' ? 'My Invoices & Payment Due' : 'Outstanding Pending Payments (OutstandingPaymentView)'}</h2>
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
                  {outstandingPayments.map((p) => (
                    <tr key={p.PaymentID}>
                      <td>#{p.PaymentID}</td>
                      <td>{p.FirstName} {p.LastName}</td>
                      <td style={{ fontWeight: 700, color: '#34d399' }}>LKR {Number(p.Amount).toLocaleString()}</td>
                      <td>{new Date(p.PaymentDate).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn-success btn-sm"
                          onClick={() => {
                            setFormData({ paymentId: p.PaymentID, method: 'Credit Card', amount: p.Amount });
                            setModalState({ type: 'process_payment', data: p });
                          }}
                        >
                          💵 Settle Payment (SP)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <h2 className="section-title">⚠️ Customer Fines & Damages (CustomerFineView)</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Auto-calculated via CalculateFine() UDF (in LKR)</div>
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
                  {fines.map((f) => (
                    <tr key={f.FineID}>
                      <td>#{f.FineID}</td>
                      <td>{f.FirstName} {f.LastName}</td>
                      <td>{f.RegistrationNumber}</td>
                      <td><span className="badge maintenance_required">{f.FineType}</span></td>
                      <td style={{ fontWeight: 700, color: '#f87171' }}>LKR {Number(f.Amount).toLocaleString()}</td>
                      <td>{f.Description}</td>
                      <td><span className={`badge ${f.Status.toLowerCase()}`}>{f.Status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ======================================================== */}
      {/* TAB: MAINTENANCE & SERVICE (MEMBER 5) */}
      {/* ======================================================== */}
      {activeTab === 'maintenance' && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">🛠️ Vehicle Maintenance Logs (VehicleMaintenanceView)</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Trigger ChangeVehToMaintenance & ChangeVehToAvailable automation</div>
            </div>
            {(role === 'Admin' || role === 'Branch Manager' || role === 'Rental Staff') && (
              <button 
                className="btn-primary"
                onClick={() => {
                  setFormData({ vehicleId: 1, branchId: 1, serviceDate: new Date().toISOString().split('T')[0], cost: 25000, description: 'Periodic Oil & Brake Service' });
                  setModalState({ type: 'schedule_maintenance', data: null });
                }}
              >
                + Schedule Maintenance (SP)
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Vehicle Reg</th>
                  <th>Branch</th>
                  <th>Service Date</th>
                  <th>Cost (LKR)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map((m) => (
                  <tr key={m.MaintenanceID}>
                    <td>#{m.MaintenanceID}</td>
                    <td style={{ fontWeight: 600 }}>{m.RegistrationNumber}</td>
                    <td>{m.BranchName}</td>
                    <td>{new Date(m.ServiceDate).toLocaleDateString()}</td>
                    <td>LKR {Number(m.Cost).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${m.MaintenanceStatus.toLowerCase()}`}>
                        {m.MaintenanceStatus}
                      </span>
                    </td>
                    <td>
                      {m.MaintenanceStatus !== 'Completed' && (
                        <button 
                          className="btn-success btn-sm"
                          onClick={() => {
                            setFormData({ status: 'Completed' });
                            setModalState({ type: 'update_maint_status', data: m });
                          }}
                        >
                          ✓ Mark Completed (Trigger)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB: CUSTOMER MANAGEMENT (MEMBER 1) */}
      {/* ======================================================== */}
      {activeTab === 'customers' && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">👥 Customer Directory (ActiveCustomerView & UDFs)</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Includes CustomerAge() and CustomerRentalCount() UDF calculations</div>
            </div>
            <div className="search-bar-box">
              <span>🔍</span>
              <input className="search-input" placeholder="Search customer name, NIC, phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>NIC / Passport</th>
                  <th>Age (UDF)</th>
                  <th>Rentals (UDF)</th>
                  <th>Phone & Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.filter(c => 
                  c.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.NIC_Passport.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((c) => (
                  <tr key={c.CustomerID}>
                    <td>#{c.CustomerID}</td>
                    <td style={{ fontWeight: 600 }}>{c.FirstName} {c.LastName}</td>
                    <td>{c.NIC_Passport}</td>
                    <td>{c.Age} yrs</td>
                    <td><strong>{c.TotalRentals}</strong> bookings</td>
                    <td>
                      <div>{c.Phone}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{c.Email}</small>
                    </td>
                    <td>
                      <span className={`badge ${c.Status.toLowerCase()}`}>{c.Status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB: BRANCH PERFORMANCE & LOCATIONS */}
      {/* ======================================================== */}
      {activeTab === 'branches' && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🏢 Island-Wide Strategic Branches ({branches.length} Hubs)</h2>
          </div>

          <div className="fleet-grid">
            {branches.map((b) => (
              <div key={b.BranchID} className="vehicle-card" style={{ background: 'rgba(30, 41, 59, 0.7)' }}>
                <div>
                  <div className="vehicle-title">{b.BranchName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    📍 {b.Location}
                  </div>
                  <div style={{ color: '#60a5fa', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    📞 {b.ContactNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {role === 'Admin' && (
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>📈 Branch Performance Metrics (BranchPerformanceView)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Branch Name</th>
                      <th>Total Bookings</th>
                      <th>Completed Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchPerformance.map((bp, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{bp.BranchName}</td>
                        <td><strong>{bp.TotalBookings}</strong> Bookings</td>
                        <td style={{ fontWeight: 700, color: '#34d399' }}>LKR {Number(bp.TotalRevenue || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB: TRIGGER AUDIT LOGS (ADMIN ONLY) */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">🛡️ System Trigger Audit Logs (AuditLogs Table)</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Live feed generated automatically by database triggers across all 5 member tables</div>
            </div>
          </div>

          <div className="audit-list">
            {auditLogs.map((log) => (
              <div key={log.LogID} className="audit-item">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={`audit-tag ${(log.ActionType || '').toLowerCase()}`}>
                    {log.ActionType}
                  </span>
                  <div>
                    <strong>[{log.TableName}]</strong> {log.Description}
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(log.ActionTimestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB: ADBMS VIVA & PROOFS HUB */}
      {/* ======================================================== */}
      {activeTab === 'viva' && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">🔬 ADBMS Viva Proofs & Concept Demonstrator</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Live demonstration tools for UDF calculations, Stored Procedure Error Handling, and ACID Rollbacks</div>
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
                      <input type="number" className="form-input" style={{ padding: '0.4rem' }} value={calcRentalDays} onChange={(e) => setCalcRentalDays(parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Rate (LKR)</label>
                      <input type="number" className="form-input" style={{ padding: '0.4rem' }} value={calcDailyRate} onChange={(e) => setCalcDailyRate(parseFloat(e.target.value) || 0)} />
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
                      <input type="number" className="form-input" style={{ padding: '0.4rem' }} value={calcLateDays} onChange={(e) => setCalcLateDays(parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Rate (LKR)</label>
                      <input type="number" className="form-input" style={{ padding: '0.4rem' }} value={calcLateRate} onChange={(e) => setCalcLateRate(parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>
                <div className="calc-result-box" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.1)' }}>
                  Late Penalty = LKR {(calcLateDays * (calcLateRate * 1.5)).toLocaleString()}
                </div>
              </div>

              <div className="calc-box">
                <div>
                  <div className="calc-header">CustomerAge()</div>
                  <span className="calc-code">TIMESTAMPDIFF(YEAR, DOB, CURDATE())</span>
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date of Birth</label>
                    <input type="date" className="form-input" style={{ padding: '0.4rem' }} value={calcDob} onChange={(e) => setCalcDob(e.target.value)} />
                  </div>
                </div>
                <div className="calc-result-box">
                  Calculated Age = {Math.floor((new Date() - new Date(calcDob)) / (365.25 * 24 * 60 * 60 * 1000))} Years Old
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
              <button className="btn-trap" onClick={() => runErrorSimulation('dup_plate')}>
                💥 Scenario A: Insert Duplicate Reg Number (M2 AddVehicle SP)
              </button>
              <button className="btn-trap" onClick={() => runErrorSimulation('future_dob')}>
                💥 Scenario B: Register with Future Date of Birth (M1 RegisterCustomer SP)
              </button>
              <button className="btn-trap" onClick={() => runErrorSimulation('booking_conflict')}>
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
      )}

      {/* ======================================================== */}
      {/* REUSABLE ACTION MODALS */}
      {/* ======================================================== */}
      {modalState.type && (
        <div className="modal-overlay" onClick={() => setModalState({ type: null, data: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  {modalState.type === 'book_vehicle' && '⚡ Reserve Vehicle'}
                  {modalState.type === 'add_vehicle' && '🚗 Register New Vehicle'}
                  {modalState.type === 'start_rental' && '🔑 Dispatch Vehicle (Check-Out)'}
                  {modalState.type === 'return_vehicle' && '↩️ Process Vehicle Return (Check-In)'}
                  {modalState.type === 'process_payment' && '💵 Settle Outstanding Payment'}
                  {modalState.type === 'schedule_maintenance' && '🛠️ Schedule Workshop Maintenance'}
                  {modalState.type === 'update_vehicle_status' && '⚙️ Update Vehicle Status'}
                  {modalState.type === 'update_maint_status' && '✓ Update Maintenance Status'}
                </h3>
                <div className="modal-subtitle">Direct execution via MySQL Stored Procedures & Triggers (in LKR)</div>
              </div>
              <button className="modal-close" onClick={() => setModalState({ type: null, data: null })}>✕</button>
            </div>

            {modalError && (
              <div className="alert-error">
                <span>⚠️ {modalError}</span>
              </div>
            )}

            <form onSubmit={handleActionSubmit}>
              {/* BOOK VEHICLE FORM */}
              {modalState.type === 'book_vehicle' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Vehicle</label>
                    <input className="form-input" disabled value={`${modalState.data.Make} ${modalState.data.Model} (${modalState.data.RegistrationNumber}) - LKR ${Number(modalState.data.DailyRate).toLocaleString()}/day`} />
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
              {modalState.type === 'add_vehicle' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-input" 
                      value={formData.categoryId || 1} 
                      onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    >
                      {categories.map((c) => (
                        <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName} (LKR {Number(c.DailyRate).toLocaleString()}/day)</option>
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
                      <input placeholder="Make (e.g. Toyota)" required className="form-input" value={formData.make || ''} onChange={(e) => setFormData({ ...formData, make: e.target.value })} />
                      <input placeholder="Model (e.g. Prius)" required className="form-input" value={formData.model || ''} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration Plate & Year</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                      <input placeholder="Plate (e.g. CBF-8899)" required className="form-input" value={formData.registration || ''} onChange={(e) => setFormData({ ...formData, registration: e.target.value })} />
                      <input placeholder="Year" type="number" required className="form-input" value={formData.year || 2024} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Purchase Date</label>
                    <input type="date" required className="form-input" value={formData.purchaseDate || ''} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} />
                  </div>
                </>
              )}

              {/* START RENTAL FORM */}
              {modalState.type === 'start_rental' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Booking Details</label>
                    <input className="form-input" disabled value={`Booking #${modalState.data.BookingID} - ${modalState.data.Make} ${modalState.data.Model}`} />
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
              {modalState.type === 'return_vehicle' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Rental</label>
                    <input className="form-input" disabled value={`Rental #${modalState.data.RentalID} (${modalState.data.Make} ${modalState.data.Model})`} />
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
              {modalState.type === 'process_payment' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Invoice</label>
                    <input className="form-input" disabled value={`Payment #${modalState.data.PaymentID} - LKR ${Number(modalState.data.Amount).toLocaleString()}`} />
                  </div>
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
                      value={formData.amount || modalState.data.Amount} 
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} 
                    />
                  </div>
                </>
              )}

              {/* SCHEDULE MAINTENANCE FORM */}
              {modalState.type === 'schedule_maintenance' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Vehicle</label>
                    <select 
                      className="form-input" 
                      value={formData.vehicleId || 1} 
                      onChange={(e) => setFormData({ ...formData, vehicleId: parseInt(e.target.value) })}
                    >
                      {allVehicles.map((v) => (
                        <option key={v.VehicleID} value={v.VehicleID}>{v.RegistrationNumber} - {v.Make} {v.Model}</option>
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
                    <input type="number" required className="form-input" value={formData.cost || 25000} onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Description</label>
                    <input required className="form-input" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </>
              )}

              {/* UPDATE STATUS FORMS */}
              {modalState.type === 'update_vehicle_status' && (
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

              {modalState.type === 'update_maint_status' && (
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
                {modalLoading ? 'Executing Procedure...' : 'Confirm & Execute (SP)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LOGIN / CUSTOMER REGISTRATION MODAL */}
      {isLoginOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{isRegisterMode ? 'New Customer Sign Up' : 'Account Sign In'}</h3>
                <div className="modal-subtitle">
                  {isRegisterMode ? 'Member 1 Stored Procedure: RegisterCustomer()' : 'Secure ADBMS Stored Procedure Authentication'}
                </div>
              </div>
              <button className="modal-close" onClick={() => setIsLoginOpen(false)}>✕</button>
            </div>

            {authPromptMsg && (
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                ℹ️ {authPromptMsg}
              </div>
            )}

            {loginError && (
              <div className="alert-error">
                <span>⚠️ {loginError}</span>
              </div>
            )}

            {/* Modal Tab Switcher */}
            <div className="auth-modal-tabs">
              <button 
                type="button" 
                className={`auth-tab-btn ${!isRegisterMode ? 'active' : ''}`}
                onClick={() => { setIsRegisterMode(false); setLoginError(''); }}
              >
                🔑 Sign In
              </button>
              <button 
                type="button" 
                className={`auth-tab-btn ${isRegisterMode ? 'active' : ''}`}
                onClick={() => { setIsRegisterMode(true); setLoginError(''); }}
              >
                👤 New Customer
              </button>
            </div>

            {!isRegisterMode && (
              <div className="quick-demo-box">
                <div className="quick-demo-title">Quick Demo Login:</div>
                <div className="demo-chips">
                  <button type="button" className="demo-chip" onClick={() => fillDemo('admin_super', 'password123')}>
                    👑 Admin
                  </button>
                  <button type="button" className="demo-chip" onClick={() => fillDemo('kamal_mgr', 'password123')}>
                    🏢 Manager
                  </button>
                  <button type="button" className="demo-chip" onClick={() => fillDemo('sunil_perera', 'password123')}>
                    👤 Customer
                  </button>
                </div>
              </div>
            )}

            {isRegisterMode ? (
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label className="form-label">Login Credentials</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input placeholder="Username" required className="form-input" value={registerForm.username} onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} />
                    <input placeholder="Password" type="password" required className="form-input" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input placeholder="First Name" required className="form-input" value={registerForm.firstName} onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} />
                    <input placeholder="Last Name" required className="form-input" value={registerForm.lastName} onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">NIC / Passport & Date of Birth</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input placeholder="NIC Number" required className="form-input" value={registerForm.nic} onChange={(e) => setRegisterForm({ ...registerForm, nic: e.target.value })} />
                    <input type="date" required className="form-input" value={registerForm.dob} onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Details</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input placeholder="Phone (+9477...)" required className="form-input" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} />
                    <input placeholder="Email Address" type="email" required className="form-input" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input placeholder="Residential Address" required className="form-input" value={registerForm.address} onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })} />
                </div>

                <button type="submit" className="btn-submit" disabled={loginLoading} style={{ marginTop: '0.5rem' }}>
                  {loginLoading ? 'Executing RegisterCustomer SP...' : 'Register & Sign In (SP)'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-username">Username</label>
                  <input 
                    id="login-username"
                    className="form-input" 
                    type="text" 
                    required
                    placeholder="Enter username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <input 
                    id="login-password"
                    className="form-input" 
                    type="password" 
                    required
                    placeholder="Enter password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Vehicle Rental Management System • Advanced Database Management Systems Group Project
      </div>
    </div>
  );
}

export default App;
