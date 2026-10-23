import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/api';

export default function ProfileTab({
  currentUser,
  onUpdateCurrentUser,
  branches = [],
  onNavigate,
  showToast
}) {
  const [profileData, setProfileData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('details'); // 'details' | 'security' | 'activity' | 'architecture'

  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [branchId, setBranchId] = useState(1);
  const [nic, setNic] = useState('');
  const [dob, setDob] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Fetch complete profile on mount or user change
  const loadProfile = async () => {
    if (!currentUser?.UserID) return;
    setLoading(true);
    setProfileError('');
    try {
      const data = await api.fetchUserProfile(currentUser.UserID);
      if (data && data.profile) {
        setProfileData(data.profile);
        setUserStats(data.stats || {});
        // Populate form
        setFirstName(data.profile.FirstName !== 'Admin' && data.profile.FirstName !== 'System' ? data.profile.FirstName || '' : data.profile.FirstName || '');
        setLastName(data.profile.LastName || '');
        setPhone(data.profile.Phone !== '-' ? data.profile.Phone || '' : '');
        setEmail(data.profile.Email !== '-' ? data.profile.Email || '' : '');
        setAddress(data.profile.Address !== '-' ? data.profile.Address || '' : '');
        setBranchId(data.profile.BranchID || 1);
        setNic(data.profile.NIC_Passport || '');
        if (data.profile.DOB) {
          const dobFormatted = data.profile.DOB.split('T')[0];
          setDob(dobFormatted);
        }
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
      setProfileError('Failed to load profile details from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser?.UserID]);

  const role = currentUser?.RoleName || profileData?.RoleName || 'Customer';
  const isAdmin = role === 'Admin';
  const isManager = role === 'Branch Manager';
  const isStaff = role === 'Rental Staff';
  const isEmployee = isManager || isStaff;
  const isCustomer = role === 'Customer';

  // Calculate age if Customer
  const calculatedAge = useMemo(() => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }, [dob]);

  // Password Strength evaluation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score += 25;
    if (newPassword.length >= 10) score += 25;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 25;
    if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score += 25;
    return score;
  }, [newPassword]);

  // Handle Profile Save
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        branchId: isEmployee || isAdmin ? parseInt(branchId, 10) : undefined,
        nic: isCustomer ? nic.trim() : undefined,
        dob: isCustomer && dob ? dob : undefined
      };

      const res = await api.updateUserProfile(currentUser.UserID, payload);
      setProfileSuccess(res.message || 'Profile saved successfully!');
      if (showToast) showToast('Profile details updated successfully!');

      if (res.user) {
        setProfileData(res.user);
        // Synchronize with parent state & storage
        const updatedUser = {
          ...currentUser,
          ...res.user,
          FullName: `${res.user.FirstName || ''} ${res.user.LastName || ''}`.trim() || res.user.FullName
        };
        onUpdateCurrentUser(updatedUser);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
      if (showToast) showToast(`Error: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current account password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.changeUserPassword(currentUser.UserID, {
        currentPassword,
        newPassword
      });
      setPasswordSuccess(res.message || 'Password updated successfully!');
      if (showToast) showToast('Security password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
      if (showToast) showToast(`Error: ${err.message}`);
    } finally {
      setSavingPassword(false);
    }
  };

  // Role visual configuration
  const roleBadgeConfig = useMemo(() => {
    switch (role) {
      case 'Admin':
        return {
          icon: 'fa-crown',
          title: 'System Administrator',
          glowColor: 'var(--yellow)',
          badgeClass: 'role-admin',
          heroIcon: '👑',
          accentGradient: 'linear-gradient(135deg, rgba(245, 197, 24, 0.2) 0%, rgba(217, 119, 6, 0.05) 100%)'
        };
      case 'Branch Manager':
        return {
          icon: 'fa-building-shield',
          title: 'Branch Operations Manager',
          glowColor: '#818cf8',
          badgeClass: 'role-manager',
          heroIcon: '🏢',
          accentGradient: 'linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(79, 70, 229, 0.05) 100%)'
        };
      case 'Rental Staff':
        return {
          icon: 'fa-id-badge',
          title: 'Fleet Rental Staff',
          glowColor: '#38bdf8',
          badgeClass: 'role-staff',
          heroIcon: '👔',
          accentGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(14, 165, 233, 0.05) 100%)'
        };
      case 'Customer':
      default:
        return {
          icon: 'fa-circle-user',
          title: 'Registered Customer',
          glowColor: '#34d399',
          badgeClass: 'role-customer',
          heroIcon: '👤',
          accentGradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(5, 150, 105, 0.05) 100%)'
        };
    }
  }, [role]);

  const displayFullName = profileData?.FullName || currentUser?.FullName || `${firstName} ${lastName}`.trim() || currentUser?.Username || 'System User';
  const displayUsername = profileData?.Username || currentUser?.Username || 'user';
  const displayInitial = displayFullName.charAt(0).toUpperCase() || 'U';

  const memberSinceFormatted = useMemo(() => {
    const rawDate = profileData?.CreatedAt || currentUser?.CreatedAt;
    if (!rawDate) return 'Active Member';
    try {
      const d = new Date(rawDate);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Active Member';
    }
  }, [profileData?.CreatedAt, currentUser?.CreatedAt]);

  return (
    <div className="profile-container fade-in">
      {/* ========================================================
          1. HERO HEADER PROFILE CAPSULE (WOW FACTOR)
          ======================================================== */}
      <div 
        className="profile-hero-card" 
        style={{ background: roleBadgeConfig.accentGradient }}
      >
        <div className="profile-hero-main">
          {/* Avatar Ring */}
          <div className="profile-avatar-wrapper">
            <div 
              className="profile-avatar-circle"
              style={{ borderColor: roleBadgeConfig.glowColor, boxShadow: `0 0 25px ${roleBadgeConfig.glowColor}40` }}
            >
              <span>{displayInitial}</span>
            </div>
            <div className="profile-status-dot" title="Active Verified Account"></div>
          </div>

          {/* User Headline & Identifiers */}
          <div className="profile-hero-info">
            <div className="profile-hero-topline">
              <span className={`role-badge ${roleBadgeConfig.badgeClass}`}>
                {roleBadgeConfig.heroIcon} {roleBadgeConfig.title}
              </span>
              <span className="profile-id-badge">
                <i className="fa-solid fa-fingerprint"></i> User ID #{currentUser?.UserID}
              </span>
              {profileData?.CustomerID && (
                <span className="profile-id-badge" style={{ color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}>
                  <i className="fa-solid fa-address-card"></i> Customer #{profileData.CustomerID}
                </span>
              )}
              {profileData?.EmployeeID && (
                <span className="profile-id-badge" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                  <i className="fa-solid fa-briefcase"></i> Employee #{profileData.EmployeeID}
                </span>
              )}
            </div>

            <h1 className="profile-hero-name">
              {displayFullName}
            </h1>

            <div className="profile-meta-pills">
              <div className="meta-pill">
                <i className="fa-solid fa-at" style={{ color: 'var(--yellow)' }}></i>
                <span>{displayUsername}</span>
              </div>
              <div className="meta-pill">
                <i className="fa-solid fa-calendar-check" style={{ color: 'rgba(255, 255, 255, 0.6)' }}></i>
                <span>Member since {memberSinceFormatted}</span>
              </div>
              <div className="meta-pill">
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--yellow)' }}></i>
                <span>{profileData?.BranchName || 'Colombo City Hub (Main HQ)'}</span>
              </div>
              <div className="meta-pill" style={{ color: '#34d399' }}>
                <i className="fa-solid fa-shield-halved"></i>
                <span>Status: {profileData?.AccountStatus || 'Active'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="profile-hero-actions">
          <button 
            type="button" 
            className="btn-profile-action"
            onClick={loadProfile}
            title="Reload live database data"
          >
            <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. PROFILE SUB-NAVIGATION TABS
          ======================================================== */}
      <div className="profile-subnav">
        <button
          type="button"
          className={`profile-subnav-btn ${activeSubTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('details')}
        >
          <i className="fa-solid fa-user-pen"></i>
          <span>Personal Information & Editor</span>
        </button>

        <button
          type="button"
          className={`profile-subnav-btn ${activeSubTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('security')}
        >
          <i className="fa-solid fa-lock"></i>
          <span>Security & Password</span>
        </button>

        <button
          type="button"
          className={`profile-subnav-btn ${activeSubTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('activity')}
        >
          <i className="fa-solid fa-chart-line"></i>
          <span>Activity & Role Privileges</span>
        </button>
      </div>

      {/* ========================================================
          3. TAB 1: PERSONAL INFORMATION & PROFILE EDITOR
          ======================================================== */}
      {activeSubTab === 'details' && (
        <div className="profile-panel-grid">
          {/* Main Edit Form */}
          <div className="profile-card profile-main-card">
            <div className="profile-card-header">
              <div>
                <h3 className="profile-card-title">
                  <i className="fa-solid fa-sliders" style={{ color: 'var(--yellow)' }}></i> Edit Profile Details
                </h3>
                <p className="profile-card-subtitle">
                  Update your contact information, personal particulars, and branch hub preferences.
                </p>
              </div>
            </div>

            {/* Locked Credentials Security Banner */}
            <div className="user-security-banner" style={{ margin: '0 0 1.5rem 0' }}>
              <i className="fa-solid fa-shield-halved" style={{ color: 'var(--yellow)', fontSize: '1.25rem' }}></i>
              <div>
                <strong>Account Security Policy:</strong> Username (<code>{displayUsername}</code>) and System Role (<code>{role}</code>) are permanent credentials managed by system administrators.
              </div>
            </div>

            {profileError && (
              <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="alert-success" style={{ marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-circle-check"></i>
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              {/* Row 1: First Name & Last Name */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    First Name <span style={{ color: 'var(--yellow)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Row 2: Immutable Username & Role Fields */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    System Username <i className="fa-solid fa-lock" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}></i>
                  </label>
                  <div className="locked-input-wrapper">
                    <input
                      type="text"
                      className="form-input locked-input"
                      value={displayUsername}
                      disabled
                      readOnly
                    />
                    <span className="locked-input-tag">Immutable Handle</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    System Role <i className="fa-solid fa-lock" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}></i>
                  </label>
                  <div className="locked-input-wrapper">
                    <input
                      type="text"
                      className="form-input locked-input"
                      value={`${role} (Access Tier ${currentUser?.RoleID || 4})`}
                      disabled
                      readOnly
                    />
                    <span className="locked-input-tag" style={{ color: roleBadgeConfig.glowColor }}>
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Phone & Email */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Contact Phone Number <span style={{ color: 'var(--yellow)' }}>*</span>
                  </label>
                  <div className="input-with-icon">
                    <i className="fa-solid fa-phone input-icon"></i>
                    <input
                      type="tel"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      required={isCustomer}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-with-icon">
                    <i className="fa-solid fa-envelope input-icon"></i>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@rento.lk"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Address */}
              <div className="form-group">
                <label className="form-label">
                  {isCustomer ? 'Residential / Billing Address' : 'Contact / Operating Address'}
                </label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-map-location-dot input-icon"></i>
                  <input
                    type="text"
                    className="form-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, Province"
                  />
                </div>
              </div>

              {/* Role-Specific Fields for Customer (NIC & DOB) */}
              {isCustomer && (
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">NIC / Passport Number</label>
                    <div className="input-with-icon">
                      <i className="fa-solid fa-id-card input-icon"></i>
                      <input
                        type="text"
                        className="form-input"
                        value={nic}
                        onChange={(e) => setNic(e.target.value)}
                        placeholder="e.g. 199512345678"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Date of Birth {calculatedAge !== null && <span style={{ color: 'var(--yellow)', fontSize: '0.8rem' }}>({calculatedAge} yrs old)</span>}
                    </label>
                    <div className="input-with-icon">
                      <i className="fa-solid fa-cake-candles input-icon"></i>
                      <input
                        type="date"
                        className="form-input"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Role-Specific Fields for Staff & Branch Managers: Assigned Branch Hub */}
              {(isEmployee || isAdmin) && (
                <div className="form-group">
                  <label className="form-label">
                    Assigned Operational Hub {isAdmin ? '(System-Wide Administrator)' : '*'}
                  </label>
                  <div className="input-with-icon">
                    <i className="fa-solid fa-building-columns input-icon"></i>
                    <select
                      className="form-input"
                      value={branchId}
                      onChange={(e) => setBranchId(parseInt(e.target.value, 10))}
                    >
                      {branches.map((b) => (
                        <option key={b.BranchID} value={b.BranchID}>
                          {b.BranchName} — {b.Location} ({b.ContactNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                    Staff operations and rental checkouts are attributed to this operational hub.
                  </small>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-profile-secondary"
                  onClick={loadProfile}
                  disabled={savingProfile}
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '12px', fontWeight: 800 }}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Saving Profile...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk"></i> Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar: Quick Identity Overview */}
          <div className="profile-card profile-side-card">
            <h3 className="profile-card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              <i className="fa-solid fa-id-badge" style={{ color: 'var(--yellow)' }}></i> Identity Passport
            </h3>

            <div className="id-card-visual">
              <div className="id-card-chip">
                <i className="fa-solid fa-sim-card"></i>
              </div>
              <div className="id-card-title">RENTO DIGITAL IDENTITY</div>
              <div className="id-card-number">
                VRDB-00{currentUser?.UserID}-{profileData?.RoleName?.slice(0, 3)?.toUpperCase() || 'USR'}
              </div>
              <div className="id-card-footer">
                <div>
                  <div className="id-card-label">CARD HOLDER</div>
                  <div className="id-card-value">{displayFullName}</div>
                </div>
                <div>
                  <div className="id-card-label">SECURITY TIER</div>
                  <div className="id-card-value">{role}</div>
                </div>
              </div>
            </div>

            <div className="passport-stats-list">
              <div className="passport-stat-row">
                <span className="passport-label">
                  <i className="fa-solid fa-database"></i> Relational ID
                </span>
                <span className="passport-value">UserID #{currentUser?.UserID}</span>
              </div>
              <div className="passport-stat-row">
                <span className="passport-label">
                  <i className="fa-solid fa-circle-check"></i> Account Status
                </span>
                <span className="passport-status-pill">
                  <span className="status-indicator-dot"></span>
                  {profileData?.AccountStatus || 'Active'} Verified
                </span>
              </div>
              <div className="passport-stat-row">
                <span className="passport-label">
                  <i className="fa-solid fa-calendar"></i> Registered Date
                </span>
                <span className="passport-value">{memberSinceFormatted}</span>
              </div>
              {profileData?.BranchName && (
                <div className="passport-stat-row">
                  <span className="passport-label">
                    <i className="fa-solid fa-building"></i> Operating Hub
                  </span>
                  <span className="passport-value">{profileData.BranchName}</span>
                </div>
              )}
            </div>

            {/* Quick Actions Shortcuts */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Quick System Links
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {isCustomer && (
                  <>
                    <button 
                      type="button" 
                      className="btn-profile-shortcut"
                      onClick={() => onNavigate && onNavigate('my_bookings')}
                    >
                      <i className="fa-solid fa-calendar-days"></i> View My Bookings
                    </button>
                    <button 
                      type="button" 
                      className="btn-profile-shortcut"
                      onClick={() => onNavigate && onNavigate('my_invoices')}
                    >
                      <i className="fa-solid fa-file-invoice-dollar"></i> View My Invoices
                    </button>
                  </>
                )}
                {isEmployee && (
                  <>
                    <button 
                      type="button" 
                      className="btn-profile-shortcut"
                      onClick={() => onNavigate && onNavigate('fleet')}
                    >
                      <i className="fa-solid fa-warehouse"></i> Fleet Inventory
                    </button>
                    <button 
                      type="button" 
                      className="btn-profile-shortcut"
                      onClick={() => onNavigate && onNavigate('rentals')}
                    >
                      <i className="fa-solid fa-key"></i> Active Rentals
                    </button>
                  </>
                )}
                {isAdmin && (
                  <>
                    <button 
                      type="button" 
                      className="btn-profile-shortcut"
                      onClick={() => onNavigate && onNavigate('dashboard')}
                    >
                      <i className="fa-solid fa-chart-pie"></i> Executive KPI Dashboard
                    </button>
                    <button 
                      type="button" 
                      className="btn-profile-shortcut"
                      onClick={() => onNavigate && onNavigate('users')}
                    >
                      <i className="fa-solid fa-user-shield"></i> User Accounts Admin
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. TAB 2: SECURITY & PASSWORD SETTINGS
          ======================================================== */}
      {activeSubTab === 'security' && (
        <div className="profile-panel-grid">
          <div className="profile-card profile-main-card">
            <div className="profile-card-header">
              <div>
                <h3 className="profile-card-title">
                  <i className="fa-solid fa-key" style={{ color: 'var(--yellow)' }}></i> Account Security & Password
                </h3>
                <p className="profile-card-subtitle">
                  Safely change your password with instant cryptographic verification and automated audit logging.
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="alert-success" style={{ marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-circle-check"></i>
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              {/* Current Password */}
              <div className="form-group">
                <label className="form-label">
                  Current Password <span style={{ color: 'var(--yellow)' }}>*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current account password"
                    required
                  />
                  <button
                    type="button"
                    className="btn-pw-toggle"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    tabIndex={-1}
                  >
                    <i className={`fa-solid ${showCurrentPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Demo Accounts accept default password <code>password123</code> or stored hash.
                </small>
              </div>

              {/* New Password */}
              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label className="form-label">
                  New Password <span style={{ color: 'var(--yellow)' }}>*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="btn-pw-toggle"
                    onClick={() => setShowNewPw(!showNewPw)}
                    tabIndex={-1}
                  >
                    <i className={`fa-solid ${showNewPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="password-meter-container">
                    <div className="password-meter-bar">
                      <div
                        className="password-meter-fill"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor:
                            passwordStrength <= 25 ? '#f87171' :
                            passwordStrength <= 50 ? '#fb923c' :
                            passwordStrength <= 75 ? '#facc15' : '#34d399'
                        }}
                      ></div>
                    </div>
                    <div className="password-meter-label">
                      Strength: {
                        passwordStrength <= 25 ? 'Weak' :
                        passwordStrength <= 50 ? 'Fair' :
                        passwordStrength <= 75 ? 'Good' : 'Strong & Secure'
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label className="form-label">
                  Confirm New Password <span style={{ color: 'var(--yellow)' }}>*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '6px' }}>
                    <i className="fa-solid fa-circle-xmark"></i> Passwords do not match
                  </div>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <div style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '6px' }}>
                    <i className="fa-solid fa-circle-check"></i> Passwords match perfectly
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '12px', fontWeight: 800 }}
                  disabled={savingPassword || (confirmPassword && newPassword !== confirmPassword)}
                >
                  {savingPassword ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Updating Credentials...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-shield"></i> Confirm & Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Information Card */}
          <div className="profile-card profile-side-card">
            <h3 className="profile-card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              <i className="fa-solid fa-shield-halved" style={{ color: 'var(--yellow)' }}></i> Security Protocol
            </h3>

            <div className="security-notice-list">
              <div className="sec-notice-item">
                <i className="fa-solid fa-fingerprint" style={{ color: 'var(--yellow)' }}></i>
                <div>
                  <strong>Bcrypt & Stored Hash:</strong>
                  <p>Credentials in VehicleRentalDB are protected using database hashes.</p>
                </div>
              </div>

              <div className="sec-notice-item">
                <i className="fa-solid fa-clipboard-list" style={{ color: '#38bdf8' }}></i>
                <div>
                  <strong>Automatic Security Auditing:</strong>
                  <p>Every account change is recorded in the permanent security audit ledger.</p>
                </div>
              </div>

              <div className="sec-notice-item">
                <i className="fa-solid fa-user-lock" style={{ color: '#34d399' }}></i>
                <div>
                  <strong>Role Isolation:</strong>
                  <p>Your access tier ({role}) is governed and isolated by enterprise access policies.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. TAB 3: ACTIVITY & ROLE PRIVILEGES
          ======================================================== */}
      {activeSubTab === 'activity' && (
        <div className="profile-activity-section">
          {/* Role Intelligence Grid */}
          <div className="activity-kpi-grid">
            {isCustomer && (
              <>
                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(245, 197, 24, 0.15)', color: 'var(--yellow)' }}>
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num">{userStats?.totalBookings || 0}</div>
                    <div className="act-label">Total Bookings Placed</div>
                  </div>
                </div>

                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                    <i className="fa-solid fa-key"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num">{userStats?.ongoingRentals || 0}</div>
                    <div className="act-label">Active Ongoing Rentals</div>
                  </div>
                </div>

                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' }}>
                    <i className="fa-solid fa-receipt"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num" style={{ color: userStats?.unpaidFines > 0 ? '#f87171' : 'inherit' }}>
                      {userStats?.unpaidFines || 0}
                    </div>
                    <div className="act-label">
                      Unpaid Fines {userStats?.unpaidFineAmount > 0 && `(LKR ${Number(userStats.unpaidFineAmount).toLocaleString()})`}
                    </div>
                  </div>
                </div>

                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
                    <i className="fa-solid fa-award"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num" style={{ color: '#34d399', fontSize: '1.4rem' }}>Premier</div>
                    <div className="act-label">Customer Tier Standing</div>
                  </div>
                </div>
              </>
            )}

            {isEmployee && (
              <>
                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(245, 197, 24, 0.15)', color: 'var(--yellow)' }}>
                    <i className="fa-solid fa-warehouse"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num">{userStats?.branchVehicles || 0}</div>
                    <div className="act-label">Branch Fleet Vehicles</div>
                  </div>
                </div>

                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                    <i className="fa-solid fa-car-side"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num">{userStats?.branchActiveRentals || 0}</div>
                    <div className="act-label">Branch Active Rentals</div>
                  </div>
                </div>

                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#fb923c' }}>
                    <i className="fa-solid fa-screwdriver-wrench"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num">{userStats?.branchMaintenance || 0}</div>
                    <div className="act-label">Pending Maintenance Jobs</div>
                  </div>
                </div>

                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8' }}>
                    <i className="fa-solid fa-building"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num" style={{ fontSize: '1.1rem' }}>{profileData?.BranchName?.split(' ')[0] || 'Colombo'}</div>
                    <div className="act-label">Operational Hub Center</div>
                  </div>
                </div>
              </>
            )}

            {isAdmin && (
              <>
                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(245, 197, 24, 0.15)', color: 'var(--yellow)' }}>
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num">{userStats?.totalUsers || 0}</div>
                    <div className="act-label">Total System Users</div>
                  </div>
                </div>

                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                    <i className="fa-solid fa-car"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num">{userStats?.totalVehicles || 0}</div>
                    <div className="act-label">National Fleet Size</div>
                  </div>
                </div>

                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num">{userStats?.totalBranches || 0}</div>
                    <div className="act-label">Active Islandwide Hubs</div>
                  </div>
                </div>

                <div className="activity-kpi-card">
                  <div className="act-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div className="act-content">
                    <div className="act-num">{userStats?.totalAudits || 0}</div>
                    <div className="act-label">Logged Security Events</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Role Privileges Overview Card */}
          <div className="profile-card" style={{ marginTop: '1.5rem' }}>
            <h3 className="profile-card-title">
              <i className="fa-solid fa-unlock-keyhole" style={{ color: 'var(--yellow)' }}></i> Granted Privileges for {role}
            </h3>
            <p className="profile-card-subtitle" style={{ marginBottom: '1.25rem' }}>
              Your system permissions are governed by Enterprise Role-Based Access Control (RBAC).
            </p>

            <div className="privilege-badges-grid">
              {isAdmin && (
                <>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Full Platform & User Administration
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> User Account Creation & Management
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Executive KPI Dashboard & Revenue Analytics
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Security & Activity Audit Trail Inspection
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Fleet Acquisition & Branch Hub Configuration
                  </div>
                </>
              )}

              {isManager && (
                <>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Branch Fleet Inventory Management
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Rental Approvals & Vehicle Checkouts
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Return Inspections & Mileage Validation
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Maintenance Scheduling & Service Updates
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Payment Collection & Fine Settlement
                  </div>
                </>
              )}

              {isStaff && (
                <>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Rental Handover & Key Dispatch
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Return Acceptance & Odometer Logging
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Booking Verification & Customer Assistance
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Receipt & Invoice Processing
                  </div>
                </>
              )}

              {isCustomer && (
                <>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Real-time Fleet Catalog Browsing
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Vehicle Booking & Reservation
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Personal Rental History & Invoices
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Automated Receipt Generation
                  </div>
                  <div className="privilege-chip grant">
                    <i className="fa-solid fa-check"></i> Profile & Password Self-Service Editor
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
