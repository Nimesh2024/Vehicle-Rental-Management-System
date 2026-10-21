const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal JSON response handler
 */
async function handleResponse(res, defaultErrorMsg = 'Request failed') {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || defaultErrorMsg);
  }
  return data;
}

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================
export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return handleResponse(res, 'Authentication failed');
}

export async function registerCustomer(formData) {
  const res = await fetch(`${API_BASE}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return handleResponse(res, 'Customer registration failed');
}

export async function fetchCustomersAll() {
  const res = await fetch(`${API_BASE}/customers/all`);
  return handleResponse(res, 'Failed to fetch customers');
}

// ==========================================
// 2. VEHICLES & FLEET
// ==========================================
export async function fetchAvailableVehicles() {
  const res = await fetch(`${API_BASE}/vehicles`);
  return handleResponse(res, 'Failed to fetch available vehicles');
}

export async function fetchAllVehicles() {
  const res = await fetch(`${API_BASE}/vehicles/all`);
  return handleResponse(res, 'Failed to fetch all vehicles');
}

export async function fetchBranches() {
  const res = await fetch(`${API_BASE}/branches`);
  return handleResponse(res, 'Failed to fetch branches');
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  return handleResponse(res, 'Failed to fetch categories');
}

export async function addVehicle(vehicleData) {
  const res = await fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicleData)
  });
  return handleResponse(res, 'Failed to add vehicle');
}

export async function updateVehicleStatus(vehicleId, status) {
  const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return handleResponse(res, 'Failed to update vehicle status');
}

// ==========================================
// 3. BOOKINGS & RENTALS
// ==========================================
export async function fetchAllBookings() {
  const res = await fetch(`${API_BASE}/bookings`);
  return handleResponse(res, 'Failed to fetch bookings');
}

export async function fetchCustomerBookings(customerId) {
  const res = await fetch(`${API_BASE}/customer/${customerId}/bookings`);
  return handleResponse(res, 'Failed to fetch customer bookings');
}

export async function bookVehicle(bookingData) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  return handleResponse(res, 'Failed to confirm booking');
}

export async function fetchActiveRentals() {
  const res = await fetch(`${API_BASE}/rentals/active`);
  return handleResponse(res, 'Failed to fetch active rentals');
}

export async function fetchCustomerRentals(customerId) {
  const res = await fetch(`${API_BASE}/customer/${customerId}/rentals`);
  return handleResponse(res, 'Failed to fetch customer rentals');
}

export async function startRental(rentalData) {
  const res = await fetch(`${API_BASE}/rentals/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rentalData)
  });
  return handleResponse(res, 'Failed to start rental');
}

export async function returnVehicle(returnData) {
  const res = await fetch(`${API_BASE}/rentals/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(returnData)
  });
  return handleResponse(res, 'Failed to process vehicle return');
}

// ==========================================
// 4. PAYMENTS & FINES
// ==========================================
export async function fetchOutstandingPayments() {
  const res = await fetch(`${API_BASE}/payments/outstanding`);
  return handleResponse(res, 'Failed to fetch outstanding payments');
}

export async function fetchAllPayments() {
  const res = await fetch(`${API_BASE}/payments/all`);
  return handleResponse(res, 'Failed to fetch payments');
}

export async function fetchPaymentSummary() {
  const res = await fetch(`${API_BASE}/payments/summary`);
  return handleResponse(res, 'Failed to fetch payment summary');
}

export async function fetchFines() {
  const res = await fetch(`${API_BASE}/fines`);
  return handleResponse(res, 'Failed to fetch fines');
}

export async function fetchCustomerFines(customerId) {
  const res = await fetch(`${API_BASE}/customer/${customerId}/fines`);
  return handleResponse(res, 'Failed to fetch customer fines');
}

export async function processPayment(paymentData) {
  const res = await fetch(`${API_BASE}/payments/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  return handleResponse(res, 'Failed to process payment');
}

export async function fetchPaymentReceipt(paymentId) {
  const res = await fetch(`${API_BASE}/payments/receipt/${paymentId}`);
  return handleResponse(res, 'Failed to fetch receipt');
}

// ==========================================
// 5. MAINTENANCE & REPORTS
// ==========================================
export async function fetchMaintenance() {
  const res = await fetch(`${API_BASE}/maintenance`);
  return handleResponse(res, 'Failed to fetch maintenance records');
}

export async function scheduleMaintenance(maintenanceData) {
  const res = await fetch(`${API_BASE}/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(maintenanceData)
  });
  return handleResponse(res, 'Failed to schedule maintenance');
}

export async function updateMaintenanceStatus(maintenanceId, status) {
  const res = await fetch(`${API_BASE}/maintenance/${maintenanceId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return handleResponse(res, 'Failed to update maintenance status');
}

export async function fetchBranchPerformance() {
  const res = await fetch(`${API_BASE}/reports/branch-performance`);
  return handleResponse(res, 'Failed to fetch branch performance');
}

export async function fetchMaintenanceCost() {
  const res = await fetch(`${API_BASE}/reports/maintenance-cost`);
  return handleResponse(res, 'Failed to fetch maintenance cost');
}

// ==========================================
// 6. DASHBOARD & AUDIT LOGS
// ==========================================
export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  return handleResponse(res, 'Failed to fetch dashboard stats');
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE}/audit-logs`);
  return handleResponse(res, 'Failed to fetch audit logs');
}

// ==========================================
// 7. SIMULATION RUNNER
// ==========================================
export async function executeErrorSimulation(type) {
  if (type === 'dup_plate') {
    return fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: 1, branchId: 1, make: 'Test', model: 'Car', year: 2024,
        registration: 'CBA-1020', purchaseDate: '2024-01-01'
      })
    });
  } else if (type === 'future_dob') {
    return fetch(`${API_BASE}/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'futuristic_user_' + Date.now(), password: 'password123',
        firstName: 'Future', lastName: 'User', nic: 'NIC' + Date.now(),
        dob: '2099-01-01', phone: '999' + Date.now(), email: 'f' + Date.now() + '@f.com', address: 'Mars'
      })
    });
  } else if (type === 'booking_conflict') {
    return fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 1, vehicleId: 7,
        startDate: '2026-10-02', endDate: '2026-10-08'
      })
    });
  }
  throw new Error('Unknown simulation type');
}
