import React from 'react';

export default function CustomersTab({
  customers = [],
  searchTerm,
  setSearchTerm
}) {
  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.FirstName && c.FirstName.toLowerCase().includes(term)) ||
      (c.LastName && c.LastName.toLowerCase().includes(term)) ||
      (c.NIC_Passport && c.NIC_Passport.toLowerCase().includes(term))
    );
  });

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">👥 Customer Directory (ActiveCustomerView & UDFs)</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Includes CustomerAge() and CustomerRentalCount() UDF calculations
          </div>
        </div>
        <div className="search-bar-box">
          <span>🔍</span>
          <input 
            className="search-input" 
            placeholder="Search customer name, NIC, phone..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
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
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No customer records found.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
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
                    <span className={`badge ${(c.Status || 'active').toLowerCase()}`}>
                      {c.Status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
