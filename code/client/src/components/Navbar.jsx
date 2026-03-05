import React from "react";

const Navbar = ({ onNavigate }) => {
  const itemStyle = { color: "white", textDecoration: "none", cursor: "pointer" };

  return (
    <nav
      style={{display: "flex", justifyContent: "space-between", padding: "15px 30px", backgroundColor: "#333", color: "white"}}>
      <div
        style={{ fontSize: "1.5rem", fontWeight: "bold", cursor: "pointer" }}
        onClick={() => onNavigate("landing")}>
        AlumNet
      </div>

      <ul style={{ display: "flex", listStyle: "none", gap: "20px", margin: 0 }}>
        <li style={itemStyle} onClick={() => onNavigate("landing")}>
          Home
        </li>
        <li style={itemStyle} onClick={() => onNavigate("announcements")}>
          Announcements
        </li>
        <li style={itemStyle} onClick={() => onNavigate("profile")}>
          My Profile
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;