// src/components/Navbar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/alumnet-logo.png";
import { theme } from "../styles/ui";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <style>{css}</style>

      <nav className="navWrap">
        <div className="navInner">

          <img
            src={logo}
            className="logo"
            alt="Alumnet"
            onClick={() => navigate("/")}
          />

          <div className="links">

            <NavLink to="/" className={({isActive})=>`link ${isActive?"active":""}`}>
              Home
            </NavLink>

            <NavLink to="/directory" className={({isActive})=>`link ${isActive?"active":""}`}>
              Directory
            </NavLink>

            <NavLink to="/announcements" className={({isActive})=>`link ${isActive?"active":""}`}>
              Announcements
            </NavLink>

            <NavLink to="/profile" className={({isActive})=>`link ${isActive?"active":""}`}>
              My Profile
            </NavLink>

            {token ? (
              <button className="logoutBtn" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <NavLink to="/login" className="loginBtn">
                Login
              </NavLink>
            )}

          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

const css = `
.navWrap{
  position: sticky;
  top:0;
  z-index:50;
  width:100%;
  background:#0b2a6f;
  border-bottom:1px solid rgba(255,255,255,0.1);
}

.navInner{
  max-width:1200px;
  margin:auto;
  padding:14px 22px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.logo{
  height:40px;
  cursor:pointer;
}

.links{
  display:flex;
  gap:14px;
  align-items:center;
}

.link{
  color:rgba(255,255,255,0.9);
  text-decoration:none;
  font-size:14px;
  padding:8px 10px;
  border-radius:8px;
  transition:.2s;
}

.link:hover{
  background:rgba(255,255,255,0.12);
}

.link.active{
  background:rgba(255,255,255,0.18);
}

.logoutBtn{
  background:transparent;
  border:1px solid rgba(255,255,255,0.3);
  color:white;
  padding:8px 12px;
  border-radius:8px;
  cursor:pointer;
}

.logoutBtn:hover{
  background:rgba(255,255,255,0.15);
}

.loginBtn{
  background:white;
  color:#0b2a6f;
  padding:8px 14px;
  border-radius:8px;
  text-decoration:none;
  font-weight:600;
}
`;