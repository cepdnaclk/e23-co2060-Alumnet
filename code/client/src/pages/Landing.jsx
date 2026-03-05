// src/pages/Landing.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/hero-bg.jpeg";
import logo from "../assets/logo.jpeg";
import alumnetLogo from "../assets/alumnet-logo.png"; 

export default function Landing() {
  const nav = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(11, 42, 111, 0.95), rgba(11, 42, 111, 0.95)), url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
    >
      <style>{css}</style>

      <header className={`topbar ${mounted ? "in" : ""}`}>
        <div className="brand">
          <img src={logo} alt="AlumNet Logo" className="brandLogo" />
          <div className="brandText">by CodeX</div>
        </div>

        <div className="actions">
          <button className="topLink" onClick={() => nav("/login")}>
            Login
          </button>
          <button className="topPill" onClick={() => nav("/register")}>
            Register
          </button>
        </div>
      </header>

      <main className={`hero ${mounted ? "in" : ""}`}>
        <div className="pill">
          <img src={alumnetLogo} alt="AlumNet" className="pillLogo" />
        </div>

        <h1 className="title">
          student-alumni mentorship programme
        </h1>

        <p className="subtitle">
          Bringing students together with alumni and professionals to provide career support,
          mentorship, and skill development.
        </p>

        <div className="ctaRow">
          <button className="primary" onClick={() => nav("/register")}>
            Get Started
          </button>
          <button className="outline" onClick={() => nav("/login")}>
            Login
          </button>
        </div>
      </main>
    </div>
  );
}

const css = `
.topbar{
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 40px;
  transform: translateY(-10px);
  opacity: 0;
  transition: transform .6s ease, opacity .6s ease; 
}
.topbar.in{ transform: translateY(0); opacity: 1; }

.brand{ display:flex; align-items:center; gap:14px; }
.brandLogo{ width:50px; height:50px; border-radius:10px; object-fit:cover; }
.brandText{ color:white; font-weight:400; letter-spacing:.06em; opacity:.9; }

.actions{ display:flex; align-items:center; gap:14px; }

.topLink{
  border:none; background:transparent; color:white; cursor:pointer;
  font-size:14px; opacity:.9; letter-spacing:.10em;
  transition: transform .18s ease, opacity .18s ease;
}
.topLink:hover{ transform: translateY(-2px); opacity: 1; }

.topPill{
  border:none; background:white; color:#0b2a6f;
  padding:10px 16px; border-radius:999px; cursor:pointer;
  font-weight:400; letter-spacing:.10em;
  transition: transform .18s ease, box-shadow .18s ease;
}
.topPill:hover{ transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 30px rgba(0,0,0,.25); }

.hero{
  max-width:1100px; margin:0 auto; padding:40px 20px 40px;
  text-align:center; color:white;
  transform: translateY(14px);
  opacity: 0;
  transition: transform .7s ease .05s, opacity .7s ease .05s;
}
.hero.in{ transform: translateY(0); opacity: 1; }

.pill{
  display:inline-flex; align-items:center; justify-content:center;
  margin-bottom: 8px;
}

.pillLogo{ height:140px; width:auto; }

.title{
  font-size:60px; line-height:1.0; margin:0 0 22px; font-weight:400;
  letter-spacing:.04em; letter-spacing:.0em;
}
.subtitle{
  max-width:760px; margin:0 auto 36px;
  font-size:18px; line-height:1.6; opacity:.9;
}

.ctaRow{ display:flex; gap:16px; justify-content:center; }

.primary{
  border:none; background:white; color:#0b2a6f;
  padding:12px 22px; border-radius:12px;
  font-weight:400; font-size:16px; cursor:pointer; min-width:140px;
  letter-spacing:.10em;
  transition: transform .18s ease, box-shadow .18s ease;
}
.primary:hover{ transform: translateY(-2px); box-shadow: 0 14px 34px rgba(0,0,0,.25); }

.outline{
  border:1px solid rgba(255,255,255,0.7);
  background:transparent; color:white;
  padding:12px 22px; border-radius:12px;
  font-weight:400; font-size:16px; cursor:pointer; min-width:120px;
  letter-spacing:.10em;
  transition: transform .18s ease, background .18s ease;
}
.outline:hover{ transform: translateY(-2px); background: rgba(255,255,255,0.08); }

@media (max-width: 640px){
  .topbar{ padding:18px 16px; }
  .title{ font-size:48px; }
  .ctaRow{ flex-direction:column; }
}
`;