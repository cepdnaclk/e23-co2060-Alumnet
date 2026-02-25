import React, { useState } from 'react';

const EditProfile = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Alumni Profile Settings</h2>
      <form style={{ display: 'inline-block', textAlign: 'left' }}>
        <p>Full Name: <input type="text" style={{ display: 'block', width: '300px' }} /></p>
        <p>Department: 
          <select style={{ display: 'block', width: '300px' }}>
            <option>Computer Engineering</option>
            <option>Electrical Engineering</option>
          </select>
        </p>
        <button type="button" style={{ padding: '10px 20px', background: 'green', color: 'white' }}>Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;