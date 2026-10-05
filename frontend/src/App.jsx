import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [stats, setStats] = useState({ customers: 0, vehicles: 0, rentals: 0, maintenance: 0 });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('http://localhost:5000/api/dashboard/stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        const vehiclesRes = await fetch('http://localhost:5000/api/vehicles');
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData);
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data (ensure backend is running and DB is seeded)", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 className="title">Connecting to Database...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <h1 className="title">AutoManager Pro</h1>
        <div style={{ color: 'var(--text-muted)' }}>Advanced DBMS Dashboard</div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Active Customers</div>
          <div className="stat-value">{stats.customers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Available Vehicles</div>
          <div className="stat-value">{stats.vehicles}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active Rentals</div>
          <div className="stat-value">{stats.rentals}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">In Maintenance</div>
          <div className="stat-value">{stats.maintenance}</div>
        </div>
      </div>

      <section className="section">
        <h2>Available Fleet Overview (Member 2 Module)</h2>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Registration</th>
                <th>Make & Model</th>
                <th>Category</th>
                <th>Daily Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length > 0 ? vehicles.map((v) => (
                <tr key={v.VehicleID}>
                  <td>#{v.VehicleID}</td>
                  <td style={{ fontWeight: 600 }}>{v.RegistrationNumber}</td>
                  <td>{v.Make} {v.Model}</td>
                  <td>{v.CategoryName}</td>
                  <td>${v.DailyRate}</td>
                  <td>
                    <span className={`badge ${v.Status.toLowerCase()}`}>{v.Status}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No vehicles found. Ensure the database is seeded and the backend is running.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      
      <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Vehicle Rental Management System • Advanced Database Management Systems Mini Project
      </div>
    </div>
  );
}

export default App;
