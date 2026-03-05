import React, { useState } from 'react';

const AlumniDirectory = () => {
  // Sample data to test the UI
  const [alumni] = useState([
    { id: 1, name: "Kavindi D", batch: "2023", dept: "Computer Engineering" },
    { id: 2, name: "John Doe", batch: "2022", dept: "Electrical Engineering" }
  ]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>Alumni Directory</h2>
      <input 
        type="text" 
        placeholder="Search by name or skills..." 
        style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
      />
      <div style={{ display: 'grid', gap: '15px' }}>
        {alumni.map(person => (
          <div key={person.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            {/* Role 2: Displaying the data we collected in the Profile Form */}
            <h4>{person.name}</h4>
            <p>{person.dept} - Batch of {person.batch}</p>
            <button style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlumniDirectory;