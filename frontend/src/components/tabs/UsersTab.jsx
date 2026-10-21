import React, { useState } from 'react';

export default function UsersTab({
  users = [],
  branches = [],
  onCreateUser,
  onUpdateUser,
  loading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  
  // Modal states for Create and Edit
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Filter users by search and role
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (u.Username && u.Username.toLowerCase().includes(term)) ||
      (u.FullName && u.FullName.toLowerCase().includes(term)) ||
      (u.Email && u.Email.toLowerCase().includes(term)) ||
      (u.Phone && u.Phone.toLowerCase().includes(term)) ||
      (u.BranchName && u.BranchName.toLowerCase().includes(term));

    if (selectedRole === 'ALL') return matchesSearch;
    if (selectedRole === 'MANAGER') return matchesSearch && u.RoleName === 'Branch Manager';
    if (selectedRole === 'STAFF') return matchesSearch && u.RoleName === 'Rental Staff';
    if (selectedRole === 'CUSTOMER') return matchesSearch && u.RoleName === 'Customer';
    if (selectedRole === 'ADMIN') return matchesSearch && u.RoleName === 'Admin';
    return matchesSearch;
  });

  // Calculate quick stats
  const totalUsers = users.length;
  const managersCount = users.filter((u) => u.RoleName === 'Branch Manager').length;
  const staffCount = users.filter((u) => u.RoleName === 'Rental Staff').length;
  const customersCount = users.filter((u) => u.RoleName === 'Customer').length;
  const activeCount = users.filter((u) => u.AccountStatus === 'Active').length;

  return (
    <section className="section">
      {/* Header */}
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="section-title">
            👥 User & Staff Administration
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Privileged Admin workspace to create Managers, Staff, and Normal Users with immutable credential safety.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn-primary" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 800
            }}
            onClick={() => setIsCreateOpen(true)}
          >
            <i className="fa-solid fa-user-plus"></i> Create User / Manager
          </button>
        </div>
      </div>

      {/* Security Note Banner */}
      <div className="user-security-banner">
        <i className="fa-solid fa-shield-halved" style={{ color: 'var(--yellow)', fontSize: '1.1rem' }}></i>
        <div>
          <strong>Enterprise Security Policy:</strong> Usernames and Passwords are strictly <em>immutable</em> from the profile edit screen to maintain relational integrity and audit logs.
        </div>
      </div>

      {/* KPI Statistic Badges */}
      <div className="user-kpi-grid">
        <div className="user-kpi-card" onClick={() => setSelectedRole('ALL')} style={{ cursor: 'pointer' }}>
          <div className="kpi-num">{totalUsers}</div>
          <div className="kpi-label">Total Accounts</div>
        </div>
        <div className="user-kpi-card" onClick={() => setSelectedRole('MANAGER')} style={{ cursor: 'pointer', borderLeft: '3px solid var(--yellow)' }}>
          <div className="kpi-num" style={{ color: 'var(--yellow)' }}>{managersCount}</div>
          <div className="kpi-label">Branch Managers</div>
        </div>
        <div className="user-kpi-card" onClick={() => setSelectedRole('STAFF')} style={{ cursor: 'pointer', borderLeft: '3px solid #38bdf8' }}>
          <div className="kpi-num" style={{ color: '#38bdf8' }}>{staffCount}</div>
          <div className="kpi-label">Rental Staff</div>
        </div>
        <div className="user-kpi-card" onClick={() => setSelectedRole('CUSTOMER')} style={{ cursor: 'pointer', borderLeft: '3px solid #34d399' }}>
          <div className="kpi-num" style={{ color: '#34d399' }}>{customersCount}</div>
          <div className="kpi-label">Normal Users (Customers)</div>
        </div>
        <div className="user-kpi-card">
          <div className="kpi-num" style={{ color: '#a78bfa' }}>{activeCount}</div>
          <div className="kpi-label">Active Status</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="user-filter-bar">
        <div className="user-role-filters">
          <button 
            type="button" 
            className={`user-role-chip ${selectedRole === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedRole('ALL')}
          >
            All Accounts ({totalUsers})
          </button>
          <button 
            type="button" 
            className={`user-role-chip ${selectedRole === 'MANAGER' ? 'active' : ''}`}
            onClick={() => setSelectedRole('MANAGER')}
          >
            🏢 Managers ({managersCount})
          </button>
          <button 
            type="button" 
            className={`user-role-chip ${selectedRole === 'STAFF' ? 'active' : ''}`}
            onClick={() => setSelectedRole('STAFF')}
          >
            👔 Staff ({staffCount})
          </button>
          <button 
            type="button" 
            className={`user-role-chip ${selectedRole === 'CUSTOMER' ? 'active' : ''}`}
            onClick={() => setSelectedRole('CUSTOMER')}
          >
            👤 Customers ({customersCount})
          </button>
        </div>

        <div className="search-bar-box" style={{ minWidth: '280px' }}>
          <span>🔍</span>
          <input 
            className="search-input" 
            placeholder="Search username, name, email, branch..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* User Directory Table */}
      <div style={{ overflowX: 'auto', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username (Locked)</th>
              <th>Full Name</th>
              <th>System Role</th>
              <th>Branch Assignment</th>
              <th>Contact Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                  No matching user accounts found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isManager = u.RoleName === 'Branch Manager';
                const isStaff = u.RoleName === 'Rental Staff';
                const isCustomer = u.RoleName === 'Customer';
                const isAdmin = u.RoleName === 'Admin';

                return (
                  <tr key={u.UserID}>
                    <td>
                      <span className="user-id-badge">#{u.UserID}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-lock" style={{ fontSize: '10px', color: 'var(--text-dim)' }} title="Username is immutable"></i>
                        <span style={{ fontWeight: 800, color: '#fff' }}>{u.Username}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {u.FullName || `${u.FirstName || ''} ${u.LastName || ''}`.trim() || 'System User'}
                    </td>
                    <td>
                      <span className={`role-badge ${
                        isAdmin ? 'role-admin' :
                        isManager ? 'role-manager' :
                        isStaff ? 'role-staff' : 'role-customer'
                      }`}>
                        {isManager && '🏢 '}
                        {isStaff && '👔 '}
                        {isCustomer && '👤 '}
                        {isAdmin && '👑 '}
                        {u.RoleName}
                      </span>
                    </td>
                    <td>
                      {u.BranchName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <i className="fa-solid fa-location-dot" style={{ color: 'var(--yellow)', fontSize: '11px' }}></i>
                          <span>{u.BranchName}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>All / Online</span>
                      )}
                    </td>
                    <td>
                      <div>{u.Phone !== '-' ? u.Phone : <span style={{ color: 'var(--text-dim)' }}>No phone</span>}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{u.Email !== '-' ? u.Email : ''}</small>
                    </td>
                    <td>
                      <span className={`badge ${(u.AccountStatus || 'active').toLowerCase()}`}>
                        {u.AccountStatus || 'Active'}
                      </span>
                    </td>
                    <td>
                      <button 
                        type="button" 
                        className="btn-action-edit"
                        onClick={() => setEditingUser(u)}
                        title="Edit profile details (Username/Password remain immutable)"
                      >
                        <i className="fa-solid fa-pen-to-square"></i> Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <CreateUserModal 
          branches={branches}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={async (newUserData) => {
            await onCreateUser(newUserData);
            setIsCreateOpen(false);
          }}
        />
      )}

      {/* EDIT USER PROFILE MODAL (USERNAME & PASSWORD STRICTLY IMMUTABLE) */}
      {editingUser && (
        <EditUserModal 
          user={editingUser}
          branches={branches}
          onClose={() => setEditingUser(null)}
          onSubmit={async (updatedData) => {
            await onUpdateUser(editingUser.UserID, updatedData);
            setEditingUser(null);
          }}
        />
      )}
    </section>
  );
}

// -------------------------------------------------------------
// MODAL: CREATE USER (Admin creates Manager, Staff, or Customer)
// -------------------------------------------------------------
function CreateUserModal({ branches = [], onClose, onSubmit }) {
  const [roleId, setRoleId] = useState(2); // Default to Branch Manager
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.BranchID || 1);
  const [nic, setNic] = useState('');
  const [dob, setDob] = useState('1995-05-15');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        username: username.trim(),
        password,
        roleId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        branchId: (roleId === 2 || roleId === 3) ? parseInt(branchId, 10) : null,
        nic: nic.trim(),
        dob,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim()
      });
    } catch (err) {
      setError(err.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">✨ Create User or Manager Account</h3>
            <div className="modal-subtitle">
              Provision administrative credentials for Branch Managers, Staff, or Customers
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div className="alert-error" style={{ marginBottom: '14px' }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selector Tabs */}
          <div className="form-group">
            <label className="form-label">Select Account Role *</label>
            <div className="role-selector-pills">
              <button 
                type="button" 
                className={`role-pill-btn ${roleId === 2 ? 'active manager' : ''}`}
                onClick={() => setRoleId(2)}
              >
                🏢 Branch Manager
              </button>
              <button 
                type="button" 
                className={`role-pill-btn ${roleId === 3 ? 'active staff' : ''}`}
                onClick={() => setRoleId(3)}
              >
                👔 Rental Staff
              </button>
              <button 
                type="button" 
                className={`role-pill-btn ${roleId === 4 ? 'active customer' : ''}`}
                onClick={() => setRoleId(4)}
              >
                👤 Normal User (Customer)
              </button>
            </div>
          </div>

          {/* Credentials */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input 
                className="form-input" 
                placeholder="e.g. colombo_mgr" 
                required 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Password *</label>
              <input 
                className="form-input" 
                type="password" 
                placeholder="Min. 6 characters" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          {/* Name */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input 
                className="form-input" 
                placeholder="e.g. Kamal" 
                required 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input 
                className="form-input" 
                placeholder="e.g. Gunaratne" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
              />
            </div>
          </div>

          {/* Branch Assignment for Managers and Staff */}
          {(roleId === 2 || roleId === 3) && (
            <div className="form-group">
              <label className="form-label">Assigned Branch Hub *</label>
              <select 
                className="form-input" 
                value={branchId} 
                onChange={(e) => setBranchId(parseInt(e.target.value, 10))}
              >
                {branches.map((b) => (
                  <option key={b.BranchID} value={b.BranchID}>
                    {b.BranchName} ({b.Location})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Additional details for Customers */}
          {roleId === 4 && (
            <>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">NIC / Passport *</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. 199012345678" 
                    required 
                    value={nic} 
                    onChange={(e) => setNic(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    required 
                    value={dob} 
                    onChange={(e) => setDob(e.target.value)} 
                  />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input 
                    className="form-input" 
                    placeholder="+94 77 123 4567" 
                    required 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="name@rento.lk" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input 
                  className="form-input" 
                  placeholder="Street, City" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={isSubmitting} 
            style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Creating User Account...' : `Confirm & Create ${roleId === 2 ? 'Manager' : roleId === 3 ? 'Staff' : 'Customer'} →`}
          </button>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL: EDIT USER (USERNAME & PASSWORD ARE STRICTLY IMMUTABLE)
// -------------------------------------------------------------
function EditUserModal({ user, branches = [], onClose, onSubmit }) {
  const [firstName, setFirstName] = useState(user.FirstName || '');
  const [lastName, setLastName] = useState(user.LastName || '');
  const [branchId, setBranchId] = useState(user.BranchID || branches[0]?.BranchID || 1);
  const [phone, setPhone] = useState(user.Phone !== '-' ? user.Phone : '');
  const [email, setEmail] = useState(user.Email !== '-' ? user.Email : '');
  const [address, setAddress] = useState(user.Address !== '-' ? user.Address : '');
  const [status, setStatus] = useState(user.AccountStatus || 'Active');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmployee = user.RoleName === 'Branch Manager' || user.RoleName === 'Rental Staff';
  const isCustomer = user.RoleName === 'Customer';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        branchId: isEmployee ? parseInt(branchId, 10) : null,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        status
      });
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">✏️ Edit Profile: {user.FullName || user.Username}</h3>
            <div className="modal-subtitle">
              Update personal details, branch assignments, and status.
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* LOCKED CREDENTIALS CALLOUT */}
        <div className="locked-credentials-notice">
          <div className="locked-badge-row">
            <span className="locked-badge">
              <i className="fa-solid fa-lock"></i> Username: <strong>{user.Username}</strong> (Immutable)
            </span>
            <span className="locked-badge">
              <i className="fa-solid fa-key"></i> Password: <strong>••••••••</strong> (Protected)
            </span>
          </div>
          <p className="locked-desc">
            Per system policy, usernames and passwords cannot be edited from this interface to preserve transactional integrity.
          </p>
        </div>

        {error && (
          <div className="alert-error" style={{ marginBottom: '14px' }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Fields */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input 
                className="form-input" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input 
                className="form-input" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
              />
            </div>
          </div>

          {/* Branch for Staff/Managers */}
          {isEmployee && (
            <div className="form-group">
              <label className="form-label">Assigned Branch Hub</label>
              <select 
                className="form-input" 
                value={branchId} 
                onChange={(e) => setBranchId(parseInt(e.target.value, 10))}
              >
                {branches.map((b) => (
                  <option key={b.BranchID} value={b.BranchID}>
                    {b.BranchName} ({b.Location})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Contact Details */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                className="form-input" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>

          {/* Address & Status for Customers */}
          {isCustomer && (
            <>
              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <input 
                  className="form-input" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select 
                  className="form-input" 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blacklisted">Blacklisted</option>
                </select>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={isSubmitting} 
            style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes →'}
          </button>
        </form>
      </div>
    </div>
  );
}
