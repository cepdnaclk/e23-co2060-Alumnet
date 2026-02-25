import React from 'react';

const Navbar = () => {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', backgroundColor: '#333', color: 'white' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>AlumNet</div>
      <ul style={{ display: 'flex', listStyle: 'none', gap: '20px', margin: 0 }}>
        <li><a href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</a></li>
        <li><a href="/directory" style={{ color: 'white', textDecoration: 'none' }}>Directory</a></li>
        <li><a href="/profile" style={{ color: 'white', textDecoration: 'none' }}>My Profile</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;