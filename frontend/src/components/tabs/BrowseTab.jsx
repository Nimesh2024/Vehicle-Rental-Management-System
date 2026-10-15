import React from 'react';

export default function BrowseTab({
  vehicles = [],
  categories = [],
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  currentUser,
  onRequireAuth,
  onBookVehicle
}) {
  const filteredVehicles = vehicles.filter((v) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      (v.Make && v.Make.toLowerCase().includes(term)) ||
      (v.Model && v.Model.toLowerCase().includes(term)) ||
      (v.CategoryName && v.CategoryName.toLowerCase().includes(term));
    const matchCategory = selectedCategory === 'All' || v.CategoryName === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
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
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Live available fleet powered by AvailableVehiclesView (Rates in LKR)
            </div>
          </div>
          <div className="search-bar-box">
            <span>🔍</span>
            <input 
              className="search-input" 
              placeholder="Search make, model, category..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="category-pills">
          <button 
            className={`cat-pill ${selectedCategory === 'All' ? 'active' : ''}`} 
            onClick={() => setSelectedCategory('All')}
          >
            All Categories
          </button>
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
                  <span className="vehicle-rate">
                    LKR {Number(v.DailyRate).toLocaleString()}
                    <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/day</small>
                  </span>
                </div>

                <button 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    if (!currentUser) {
                      onRequireAuth(`Please sign in or create an account to reserve the ${v.Make} ${v.Model}!`);
                    } else {
                      onBookVehicle(v);
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
  );
}
