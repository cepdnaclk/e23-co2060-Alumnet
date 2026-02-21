import React from 'react';

function Navbar() {
  return (
    <nav style={{ padding: '10px', backgroundColor: '#282c34', color: 'white' }}>
      <h2>ALUMNET</h2>
      <ul style={{ display: 'flex', listStyle: 'none', gap: '20px' }}>
        <li>Home</li>
        <li>Directory</li>
        <li>My Profile</li>
      </ul>
    </nav>
  );
}

export default Navbar;