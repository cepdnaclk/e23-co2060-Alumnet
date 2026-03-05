// src/components/Navbar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

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
          {/* Brand */}
          <div className="brand" onClick={() => navigate("/")}>
            Alumnet
          </div>

          {/* Links */}
          <div className="links">
            <NavLink to="/" className={({ isActive }) => `link ${isActive ? "active" : ""}`}>
              Home
            </NavLink>

            <NavLink
              to="/directory"
              className={({ isActive }) => `link ${isActive ? "active" : ""}`}
            >
              Directory
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) => `link ${isActive ? "active" : ""}`}
            >
              My Profile
            </NavLink>

            {token ? (
              <button className="logoutBtn" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) => `link pill ${isActive ? "active" : ""}`}
              >
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
/* Glassy dark-blue navbar */
.navWrap{
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background: rgba(11, 42, 111, 0.55);
  border-bottom: 1px solid rgba(255,255,255,0.12);
}

.navInner{
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand{
  color: #fff;
  font-size: 22px;
  letter-spacing: .02em;
  cursor: pointer;
  user-select: none;
  transition: transform .18s ease, opacity .18s ease;
}
.brand:hover{
  transform: translateY(-1px);
  opacity: .95;
}

.links{
  display: flex;
  align-items: center;
  gap: 14px;
}

.link{
  color: rgba(255,255,255,0.88);
  text-decoration: none;
  letter-spacing: .06em;
  font-size: 14px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: transform .18s ease, background .18s ease, color .18s ease;
}
.link:hover{
  transform: translateY(-2px);
  background: rgba(255,255,255,0.10);
  color: #fff;
}

.link.active{
  background: rgba(255,255,255,0.14);
  color: #fff;
}

/* Optional pill style for login */
.link.pill{
  background: rgba(255,255,255,0.92);
  color: #0b2a6f;
  border: 1px solid rgba(255,255,255,0.35);
}
.link.pill:hover{
  background: #fff;
  transform: translateY(-2px);
}

/* Logout button */
.logoutBtn{
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(0,0,0,0.08);
  color: rgba(255,255,255,0.92);
  border-radius: 10px;
  padding: 8px 12px;
  letter-spacing: .06em;
  cursor: pointer;
  transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
}
.logoutBtn:hover{
  transform: translateY(-2px);
  background: rgba(255,255,255,0.12);
  box-shadow: 0 12px 28px rgba(0,0,0,0.18);
  color: #fff;
}

@media (max-width: 640px){
  .navInner{ padding: 12px 14px; }
  .links{ gap: 8px; }
  .link{ font-size: 13px; padding: 7px 8px; }
}
`;