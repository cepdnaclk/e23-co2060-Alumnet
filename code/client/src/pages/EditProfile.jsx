import React, { useState } from 'react';

const EditProfile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    batch: '',
    department: 'Computer Engineering',
    bio: '',
    experience: '',
    education: '',
    skills: '',
    linkedIn: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving Profile Data:", profile);
    alert("Profile changes saved successfully!");
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  };

  return (
    <div style={{ padding: '30px', maxWidth: '700px', margin: '20px auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Professional Alumni Profile</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Full Name</label>
            <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} style={inputStyle} placeholder="Enter your full name" required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Batch Year</label>
            <input type="number" name="batch" value={profile.batch} onChange={handleChange} style={inputStyle} placeholder="e.g. 2023" />
          </div>
        </div>

        <label style={labelStyle}>Department</label>
        <select name="department" value={profile.department} onChange={handleChange} style={inputStyle}>
          <option value="Computer Engineering">Computer Engineering</option>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
          <option value="Civil Engineering">Civil Engineering</option>
        </select>

        <label style={labelStyle}>Short Professional Bio</label>
        <textarea name="bio" value={profile.bio} onChange={handleChange} style={{ ...inputStyle, height: '80px' }} placeholder="A brief summary of your professional background..." />

        <label style={labelStyle}>Work Experience</label>
        <textarea name="experience" value={profile.experience} onChange={handleChange} style={{ ...inputStyle, height: '80px' }} placeholder="Current position, previous roles, and companies..." />

        <label style={labelStyle}>Education</label>
        <input type="text" name="education" value={profile.education} onChange={handleChange} style={inputStyle} placeholder="Degree and University details" />

        <label style={labelStyle}>Skills (Comma separated)</label>
        <input type="text" name="skills" value={profile.skills} onChange={handleChange} style={inputStyle} placeholder="e.g. React, Python, Project Management" />

        <label style={labelStyle}>LinkedIn Profile URL</label>
        <input type="url" name="linkedIn" value={profile.linkedIn} onChange={handleChange} style={inputStyle} placeholder="https://linkedin.com/in/yourprofile" />

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
          Save Professional Details
        </button>
      </form>
    </div>
  );
};

export default EditProfile;