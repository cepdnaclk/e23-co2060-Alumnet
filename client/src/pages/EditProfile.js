import React from 'react';

function EditProfile() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Edit Professional Profile</h1>
      <form style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
        <input type="text" placeholder="Current Profession (e.g. Developer)" />
        <input type="text" placeholder="Company" />
        <input type="text" placeholder="Skills (e.g. Java, Python)" />
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}

export default EditProfile;