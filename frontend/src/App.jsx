import { useState, useEffect, useCallback } from 'react';
import './index.css';

// API Services
import * as api from './services/api';

// Common Components
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import Toast from './components/common/Toast';

// Modals
import AuthModal from './components/modals/AuthModal';
import ActionModal from './components/modals/ActionModal';
import ReceiptModal from './components/modals/ReceiptModal';

// Tab Views
import BrowseTab from './components/tabs/BrowseTab';
import DashboardTab from './components/tabs/DashboardTab';
import FleetTab from './components/tabs/FleetTab';
import BookingsTab from './components/tabs/BookingsTab';
import RentalsTab from './components/tabs/RentalsTab';
import PaymentsTab from './components/tabs/PaymentsTab';
import MaintenanceTab from './components/tabs/MaintenanceTab';
import CustomersTab from './components/tabs/CustomersTab';
import BranchesTab from './components/tabs/BranchesTab';
import AuditLogsTab from './components/tabs/AuditLogsTab';
import VivaTab from './components/tabs/VivaTab';

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

  // Active Tab & Filters
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
  const [payments, setPayments] = useState([]);
  const [outstandingPayments, setOutstandingPayments] = useState([]);
  const [fines, setFines] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [branchPerformance, setBranchPerformance] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Modals state
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({});
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Receipt Modal state
  const [receiptData, setReceiptData] = useState(null);

  // Viva Simulation State
  const [trapResult, setTrapResult] = useState(null);

  // Toast Helper
  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Primary Data Fetcher
  const loadAllData = useCallback(async () => {
    try {
      const [
        statsRes, vehRes, allVehRes, branchRes, catRes, bookRes, rentRes,
        payOutRes, payAllRes, fineRes, maintRes, branchPerfRes, custRes, auditRes
      ] = await Promise.all([
        api.fetchDashboardStats().catch(() => ({})),
        api.fetchAvailableVehicles().catch(() => []),
        api.fetchAllVehicles().catch(() => []),
        api.fetchBranches().catch(() => []),
        api.fetchCategories().catch(() => []),
        api.fetchAllBookings().catch(() => []),
        api.fetchActiveRentals().catch(() => []),
        api.fetchOutstandingPayments().catch(() => []),
        api.fetchAllPayments().catch(() => []),
        api.fetchFines().catch(() => []),
        api.fetchMaintenance().catch(() => []),
        api.fetchBranchPerformance().catch(() => []),
        api.fetchCustomersAll().catch(() => []),
        api.fetchAuditLogs().catch(() => [])
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
      setFines(Array.isArray(fineRes) ? fineRes : []);
      setMaintenance(Array.isArray(maintRes) ? maintRes : []);
      setBranchPerformance(Array.isArray(branchPerfRes) ? branchPerfRes : []);
      setCustomers(Array.isArray(custRes) ? custRes : []);
      setAuditLogs(Array.isArray(auditRes) ? auditRes : []);

      if (currentUser && currentUser.RoleName === 'Customer') {
        const custId = currentUser.CustomerID || currentUser.UserID;
        api.fetchCustomerBookings(custId)
          .then((data) => setMyBookings(Array.isArray(data) ? data : []))
          .catch(() => {});
      }

      setLoading(false);
    } catch (err) {
      console.error("Data load error:", err);
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Adjust active tab on login / role change
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
      const data = await api.loginUser(loginForm);
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
      await api.registerCustomer(registerForm);
      const loginData = await api.loginUser({
        username: registerForm.username,
        password: registerForm.password
      });

      if (loginData.user) {
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
      let result;
      const { type, data } = modalState;

      if (type === 'book_vehicle') {
        result = await api.bookVehicle(formData);
      } else if (type === 'add_vehicle') {
        result = await api.addVehicle(formData);
      } else if (type === 'start_rental') {
        result = await api.startRental(formData);
      } else if (type === 'return_vehicle') {
        result = await api.returnVehicle(formData);
      } else if (type === 'process_payment') {
        result = await api.processPayment(formData);
        // Fetch receipt data and show receipt modal
        try {
          const receipt = await api.fetchPaymentReceipt(formData.paymentId);
          setReceiptData(receipt);
        } catch (_) { /* receipt fetch is best-effort */ }
      } else if (type === 'schedule_maintenance') {
        result = await api.scheduleMaintenance(formData);
      } else if (type === 'update_vehicle_status') {
        result = await api.updateVehicleStatus(data.VehicleID, formData.status);
      } else if (type === 'update_maint_status') {
        result = await api.updateMaintenanceStatus(data.MaintenanceID, formData.status);
      }

      showToast(result?.message || 'Operation executed successfully!');
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
      const res = await api.executeErrorSimulation(type);
      const data = await res.json().catch(() => ({}));

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

  return (
    <div className="dashboard">
      {/* Toast Banner */}
      <Toast toast={toast} />

      {/* Main Header */}
      <Header 
        currentUser={currentUser} 
        onOpenLogin={() => {
          setIsLoginOpen(true);
          setIsRegisterMode(false);
          setAuthPromptMsg('');
          setLoginError('');
        }}
        onLogout={handleLogout}
      />

      {/* Dynamic Navigation Tabs */}
      <Navigation 
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          myBookingsCount: myBookings.length,
          allVehiclesCount: allVehicles.length,
          bookingsCount: bookings.length,
          rentalsCount: activeRentals.length,
          outstandingCount: outstandingPayments.length,
          maintenanceCount: maintenance.length,
          customersCount: customers.length,
          auditLogsCount: auditLogs.length
        }}
      />

      {/* Tab: Browse & Rent Fleet */}
      {activeTab === 'browse' && (
        <BrowseTab 
          vehicles={vehicles}
          categories={categories}
          branches={branches}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          currentUser={currentUser}
          onRequireAuth={(msg) => {
            setAuthPromptMsg(msg);
            setIsLoginOpen(true);
            setIsRegisterMode(false);
          }}
          onBookVehicle={(v) => {
            const custId = currentUser?.CustomerID || currentUser?.UserID || 1;
            setFormData({ vehicleId: v.VehicleID, customerId: custId, startDate: '', endDate: '' });
            setModalState({ type: 'book_vehicle', data: v });
          }}
        />
      )}

      {/* Non-Browse Management Tabs Container */}
      {activeTab !== 'browse' && (
        <div className="dashboard-container">
          {/* Tab: Executive KPI Dashboard (Admin Only) */}
          {activeTab === 'dashboard' && role === 'Admin' && (
            <DashboardTab 
              stats={stats} 
              allVehicles={allVehicles} 
              onNavigate={(tab) => setActiveTab(tab)} 
            />
          )}

          {/* Tab: Fleet Inventory */}
          {activeTab === 'fleet' && (
            <FleetTab 
              allVehicles={allVehicles}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              role={role}
              onAddVehicle={() => {
                setFormData({ categoryId: 1, branchId: 1, make: '', model: '', year: 2024, registration: '', purchaseDate: '' });
                setModalState({ type: 'add_vehicle', data: null });
              }}
              onUpdateStatus={(v) => {
                setFormData({ status: v.Status });
                setModalState({ type: 'update_vehicle_status', data: v });
              }}
            />
          )}

          {/* Tab: Bookings & My Bookings */}
          {(activeTab === 'bookings' || activeTab === 'my_bookings') && (
            <BookingsTab 
              isMyBookings={activeTab === 'my_bookings'}
              bookings={activeTab === 'my_bookings' ? myBookings : bookings}
              currentUser={currentUser}
              role={role}
              onStartRental={(b) => {
                setFormData({ bookingId: b.BookingID, startMileage: 10000 });
                setModalState({ type: 'start_rental', data: b });
              }}
            />
          )}

          {/* Tab: Active Ongoing Rentals */}
          {activeTab === 'rentals' && (
            <RentalsTab 
              activeRentals={activeRentals}
              role={role}
              onReturnVehicle={(r) => {
                setFormData({ rentalId: r.RentalID, endMileage: (r.StartMileage || 0) + 150, damageCost: 0 });
                setModalState({ type: 'return_vehicle', data: r });
              }}
            />
          )}

          {/* Tab: Payments, Fines & My Invoices */}
          {(activeTab === 'payments' || activeTab === 'my_invoices') && (
            <PaymentsTab 
              isMyInvoices={activeTab === 'my_invoices'}
              outstandingPayments={outstandingPayments}
              fines={fines}
              onSettlePayment={(p) => {
                setFormData({ paymentId: p.PaymentID, method: 'Credit Card', amount: p.Amount });
                setModalState({ type: 'process_payment', data: p });
              }}
            />
          )}

          {/* Tab: Vehicle Maintenance */}
          {activeTab === 'maintenance' && (
            <MaintenanceTab 
              maintenance={maintenance}
              role={role}
              onScheduleMaintenance={() => {
                setFormData({
                  vehicleId: 1,
                  branchId: 1,
                  serviceDate: new Date().toISOString().split('T')[0],
                  cost: 25000,
                  description: 'Periodic Oil & Brake Service'
                });
                setModalState({ type: 'schedule_maintenance', data: null });
              }}
              onUpdateStatus={(m) => {
                setFormData({ status: m.MaintenanceStatus });
                setModalState({ type: 'update_maint_status', data: m });
              }}
            />
          )}

          {/* Tab: Customers Directory */}
          {activeTab === 'customers' && (
            <CustomersTab 
              customers={customers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {/* Tab: Branches & Operational Hubs */}
          {activeTab === 'branches' && (
            <BranchesTab 
              branches={branches}
              branchPerformance={branchPerformance}
              role={role}
            />
          )}

          {/* Tab: Live Database Trigger Audit Logs */}
          {activeTab === 'audit' && (
            <AuditLogsTab auditLogs={auditLogs} />
          )}

          {/* Tab: ADBMS Viva Concept Demonstrator */}
          {activeTab === 'viva' && (
            <VivaTab 
              trapResult={trapResult}
              onRunSimulation={runErrorSimulation}
            />
          )}
        </div>
      )}

      {/* Reusable Action Modals */}
      <ActionModal 
        modalState={modalState}
        onClose={() => setModalState({ type: null, data: null })}
        formData={formData}
        setFormData={setFormData}
        modalError={modalError}
        modalLoading={modalLoading}
        onSubmit={handleActionSubmit}
        categories={categories}
        branches={branches}
        allVehicles={allVehicles}
      />

      {/* Payment Receipt Modal */}
      {receiptData && (
        <ReceiptModal
          receipt={receiptData}
          onClose={() => setReceiptData(null)}
        />
      )}

      {/* Auth Modal (Login & Customer Registration) */}
      <AuthModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        isRegisterMode={isRegisterMode}
        setIsRegisterMode={setIsRegisterMode}
        authPromptMsg={authPromptMsg}
        loginError={loginError}
        setLoginError={setLoginError}
        loginLoading={loginLoading}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        onLoginSubmit={handleLoginSubmit}
        onRegisterSubmit={handleRegisterSubmit}
        onFillDemo={fillDemo}
      />

      {/* Global Footer */}
      <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Vehicle Rental Management System • Advanced Database Management Systems Group Project
      </div>
    </div>
  );
}

export default App;
