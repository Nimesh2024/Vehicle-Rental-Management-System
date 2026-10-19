import React, { useState, useMemo } from 'react';

const VEHICLE_IMAGES = {
  Alto: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
  Vitz: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=600&q=80',
  Corolla: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80',
  Axio: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80',
  Civic: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=600&q=80',
  'X-Trail': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
  Tucson: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
  C200: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
  Mercedes: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
  BMW: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
  Prado: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80',
  'Land Cruiser': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80',
  HiAce: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
  KDH: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80'
};

function getVehicleImg(make = '', model = '') {
  for (const [key, url] of Object.entries(VEHICLE_IMAGES)) {
    if (model.toLowerCase().includes(key.toLowerCase()) || make.toLowerCase().includes(key.toLowerCase())) {
      return url;
    }
  }
  return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80';
}

export default function BrowseTab({
  vehicles = [],
  categories = [],
  branches = [],
  searchTerm = '',
  setSearchTerm,
  selectedCategory = 'All',
  setSelectedCategory,
  currentUser,
  onRequireAuth,
  onBookVehicle
}) {
  // Local filter states matching https://aa.rento.lk/rentals
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [driverOption, setDriverOption] = useState('0'); // 0: Self Drive, 1: With Driver
  const [maxPrice, setMaxPrice] = useState(80000);
  const [sortBy, setSortBy] = useState('default');
  const [isListView, setIsListView] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // Filtering & Sorting
  const filteredVehicles = useMemo(() => {
    let list = [...vehicles];

    // Search query
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((v) =>
        (v.Make && v.Make.toLowerCase().includes(term)) ||
        (v.Model && v.Model.toLowerCase().includes(term)) ||
        (v.RegistrationNumber && v.RegistrationNumber.toLowerCase().includes(term)) ||
        (v.CategoryName && v.CategoryName.toLowerCase().includes(term))
      );
    }

    // Category
    if (selectedCategory !== 'All') {
      list = list.filter((v) => v.CategoryName === selectedCategory);
    }

    // Branch Location
    if (selectedBranch !== 'All') {
      list = list.filter((v) => v.BranchName === selectedBranch || String(v.BranchID) === String(selectedBranch));
    }

    // Max Price
    list = list.filter((v) => Number(v.DailyRate || 0) <= maxPrice);

    // Sorting
    if (sortBy === 'asc') {
      list.sort((a, b) => Number(a.DailyRate) - Number(b.DailyRate));
    } else if (sortBy === 'desc') {
      list.sort((a, b) => Number(b.DailyRate) - Number(a.DailyRate));
    }

    return list;
  }, [vehicles, searchTerm, selectedCategory, selectedBranch, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedBranch('All');
    setMaxPrice(80000);
    setSearchTerm('');
    setSortBy('default');
  };

  return (
    <>
      {/* ═══ RENTAL HERO (RENTO SIGNATURE BANNER) ═══ */}
      <section className="rental-hero">
        <div className="rental-hero-content">
          <div className="rental-hero-label">
            <i className="fa-solid fa-gem" style={{ marginRight: '6px' }}></i>
            Explore Our Fleet • Sri Lanka
          </div>
          <h1 className="rental-hero-title">
            Book Your Perfect <br />
            <span>Rental</span> in Sri Lanka
          </h1>
          <p className="rental-hero-desc">
            Choose from economy hatchbacks, comfortable sedans, rugged 4x4 SUVs, and spacious passenger vans — Self-drive or with professional chauffeur. Fully maintained, insured, and powered by enterprise ADBMS.
          </p>

          <div className="hero-badges-row">
            <div className="hero-badge-pill">
              <i className="fa-solid fa-car text-yellow" style={{ color: 'var(--yellow)' }}></i>
              <span>{vehicles.length} Available Vehicles</span>
            </div>
            <div className="hero-badge-pill">
              <i className="fa-solid fa-building text-yellow" style={{ color: 'var(--yellow)' }}></i>
              <span>{branches.length || 4} Strategic Branches</span>
            </div>
            <div className="hero-badge-pill">
              <i className="fa-solid fa-shield-halved text-yellow" style={{ color: 'var(--yellow)' }}></i>
              <span>Fully Insured & Serviced</span>
            </div>
            <div className="hero-badge-pill">
              <i className="fa-solid fa-bolt text-yellow" style={{ color: 'var(--yellow)' }}></i>
              <span>Instant Stored Procedure Booking</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FLOATING SEARCH BAR (RENTO FLOATING BAR) ═══ */}
      <div className="rental-search-wrap">
        <div className="rental-search-bar">
          {/* Location */}
          <div className="rsb-group">
            <div className="rsb-label">
              <i className="fa-solid fa-location-dot"></i> Pickup Location
            </div>
            <select
              className="rsb-input"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="All">All Locations</option>
              {branches.map((b) => (
                <option key={b.BranchID} value={b.BranchName || b.BranchID}>
                  {b.BranchName}
                </option>
              ))}
            </select>
          </div>

          {/* Driver Option */}
          <div className="rsb-group">
            <div className="rsb-label">
              <i className="fa-solid fa-id-card"></i> Driver Option
            </div>
            <select
              className="rsb-input"
              value={driverOption}
              onChange={(e) => setDriverOption(e.target.value)}
            >
              <option value="0">Self Drive</option>
              <option value="1">With Chauffeur</option>
            </select>
          </div>

          {/* Pickup Date */}
          <div className="rsb-group">
            <div className="rsb-label">
              <i className="fa-solid fa-calendar-days"></i> Pickup Date
            </div>
            <input
              type="date"
              className="rsb-input"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
            />
          </div>

          {/* Return Date */}
          <div className="rsb-group">
            <div className="rsb-label">
              <i className="fa-solid fa-calendar-check"></i> Return Date
            </div>
            <input
              type="date"
              className="rsb-input"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="rsb-group">
            <div className="rsb-label">
              <i className="fa-solid fa-car-rear"></i> Vehicle Type
            </div>
            <select
              className="rsb-input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.CategoryID} value={c.CategoryName}>
                  {c.CategoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            className="rsb-btn"
            onClick={() => {
              // Smooth scroll to results
              const elem = document.getElementById('rentalGrid');
              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            Search Cars
          </button>
        </div>
      </div>

      {/* ═══ 2-COLUMN LISTING BODY (RENTO BODY) ═══ */}
      <div className="rental-body">
        {/* LEFT STICKY SIDEBAR FILTERS */}
        <aside className="rental-sidebar">
          <div className="sidebar-title">
            <span>
              <i className="fa-solid fa-sliders" style={{ color: 'var(--yellow)', marginRight: '8px' }}></i>
              Filters
            </span>
            <button
              onClick={handleResetFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--yellow)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <div className="filter-label">Vehicle Category</div>
            <label className="filter-option" onClick={() => setSelectedCategory('All')}>
              <input
                type="radio"
                name="sidebar-cat"
                checked={selectedCategory === 'All'}
                onChange={() => setSelectedCategory('All')}
              />
              <span>All Categories ({vehicles.length})</span>
            </label>
            {categories.map((c) => {
              const count = vehicles.filter((v) => v.CategoryName === c.CategoryName).length;
              return (
                <label
                  key={c.CategoryID}
                  className="filter-option"
                  onClick={() => setSelectedCategory(c.CategoryName)}
                >
                  <input
                    type="radio"
                    name="sidebar-cat"
                    checked={selectedCategory === c.CategoryName}
                    onChange={() => setSelectedCategory(c.CategoryName)}
                  />
                  <span>
                    {c.CategoryName} ({count})
                  </span>
                </label>
              );
            })}
          </div>

          <hr className="filter-divider" />

          {/* Driver Option */}
          <div className="filter-group">
            <div className="filter-label">Driver Option</div>
            <label className="filter-option">
              <input
                type="radio"
                name="sidebar-driver"
                checked={driverOption === '0'}
                onChange={() => setDriverOption('0')}
              />
              <span>Self Drive</span>
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="sidebar-driver"
                checked={driverOption === '1'}
                onChange={() => setDriverOption('1')}
              />
              <span>With Chauffeur</span>
            </label>
          </div>

          <hr className="filter-divider" />

          {/* Price Range Slider */}
          <div className="filter-group">
            <div className="filter-label">Max Price Per Day</div>
            <div className="price-range-row">
              <span>LKR 0</span>
              <span style={{ color: 'var(--yellow)' }}>LKR {maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="8000"
              max="80000"
              step="2000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            />
          </div>

          <hr className="filter-divider" />

          {/* Pickup Location */}
          <div className="filter-group">
            <div className="filter-label">Pickup Branch</div>
            <label className="filter-option" onClick={() => setSelectedBranch('All')}>
              <input
                type="radio"
                name="sidebar-loc"
                checked={selectedBranch === 'All'}
                onChange={() => setSelectedBranch('All')}
              />
              <span>All Branches</span>
            </label>
            {branches.map((b) => (
              <label
                key={b.BranchID}
                className="filter-option"
                onClick={() => setSelectedBranch(b.BranchName)}
              >
                <input
                  type="radio"
                  name="sidebar-loc"
                  checked={selectedBranch === b.BranchName}
                  onChange={() => setSelectedBranch(b.BranchName)}
                />
                <span>{b.BranchName}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* RIGHT MAIN PANEL (TOPBAR + VEHICLE CARDS) */}
        <main className="rental-main">
          <div className="rental-topbar">
            <div className="rental-topbar-left">
              <h2>Available Vehicles</h2>
              <span>
                Showing <strong>{filteredVehicles.length}</strong> vehicles verified and ready for hire
              </span>
            </div>

            <div className="rental-topbar-right">
              {/* Search input in topbar */}
              <input
                type="text"
                placeholder="Search make or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rental-select"
                style={{ width: '180px' }}
              />

              {/* Sort By */}
              <select
                className="rental-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort: Default</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>

              {/* Grid / List View Toggles */}
              <div className="view-toggles">
                <button
                  className={`view-toggle ${!isListView ? 'active' : ''}`}
                  onClick={() => setIsListView(false)}
                  title="Grid View"
                >
                  <i className="fa-solid fa-table-cells"></i>
                </button>
                <button
                  className={`view-toggle ${isListView ? 'active' : ''}`}
                  onClick={() => setIsListView(true)}
                  title="List View"
                >
                  <i className="fa-solid fa-list"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Grid / List of Vehicles */}
          <div className={`rental-grid ${isListView ? 'list-view' : ''}`} id="rentalGrid">
            {filteredVehicles.length === 0 ? (
              <div className="state-box" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-car-burst" style={{ fontSize: '3rem', marginBottom: '16px', display: 'block', color: 'var(--yellow)' }}></i>
                <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Matching Vehicles Found</h3>
                <p>Try resetting the price filter or selecting another category / location.</p>
                <button className="btn-primary" onClick={handleResetFilters} style={{ marginTop: '16px' }}>
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredVehicles.map((v) => {
                const imgUrl = getVehicleImg(v.Make, v.Model);
                return (
                  <div key={v.VehicleID} className="rc">
                    <div className="rc-img">
                      <img src={imgUrl} alt={`${v.Make} ${v.Model}`} loading="lazy" />
                      <div className="rc-badge">{v.Status || 'Available'}</div>
                      <div className="rc-rating">
                        <i className="fa-solid fa-star"></i>
                        <span>4.9</span>
                      </div>
                    </div>

                    <div className="rc-body">
                      <div className="rc-type">
                        {v.Make} • {v.CategoryName}
                      </div>
                      <div className="rc-name">
                        {v.Make} {v.Model}
                      </div>

                      <div className="rc-tags">
                        <span className="rc-tag">
                          <i className="fa-solid fa-shield-halved"></i>
                          Insurance Included
                        </span>
                        <span className="rc-tag">
                          <i className="fa-solid fa-road"></i>
                          Unlimited Km
                        </span>
                        <span className="rc-tag">
                          <i className="fa-solid fa-id-card"></i>
                          {v.RegistrationNumber}
                        </span>
                        <span className="rc-tag">
                          <i className="fa-solid fa-gear"></i>
                          Auto / A/C
                        </span>
                      </div>

                      <hr className="rc-divider" />

                      <div className="rc-footer">
                        <div className="rc-price-wrap">
                          <span className="rc-price-label">Daily Hire</span>
                          <div className="rc-price">
                            LKR {Number(v.DailyRate).toLocaleString()}
                            <sub> /day</sub>
                          </div>
                        </div>

                        <button
                          className="rc-btn"
                          onClick={() => {
                            if (!currentUser) {
                              onRequireAuth(`Please sign in or create an account to reserve the ${v.Make} ${v.Model}!`);
                            } else {
                              onBookVehicle(v);
                            }
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </>
  );
}
