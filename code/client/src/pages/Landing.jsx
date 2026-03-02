// src/pages/Landing.jsx
import heroBg from "../assets/hero-bg.jpeg";
import logo from "../assets/logo.jpeg";

export default function Landing({ onGoLogin, onGoRegister }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(2, 30, 90, 0.75), rgba(2, 30, 90, 0.75)), url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
        }}
      >
        {/* Left Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src={logo}
            alt="AlumNet Logo"
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
          <div style={{ color: "white", fontWeight: 500 }}>
            by CodeX
          </div>
        </div>

        {/* Right Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="btn" onClick={onGoLogin} style={topLinkBtn}>
            Login
          </button>
          <button className="btn" onClick={onGoRegister} style={topPillBtn}>
            Register
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "80px 20px 40px",
          textAlign: "center",
          color: "white",
        }}
      >
        <div
          className="fade-up"
          style={{
            display: "inline-block",
            padding: "10px 18px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.08)",
            fontSize: 14,
            marginBottom: 28,
          }}
        >
          Department of Computer Engineering
        </div>

        <h1
          className="fade-up delay-1"
          style={{
            fontSize: 72,
            lineHeight: 1.0,
            margin: "0 0 22px",
            fontWeight: 700,
          }}
        >
          Alumni Mentorship <br /> Programme
        </h1>

        <p
          className="fade-up delay-2"
          style={{
            maxWidth: 760,
            margin: "0 auto 36px",
            fontSize: 18,
            lineHeight: 1.6,
            opacity: 0.9,
          }}
        >
          Bringing students together with alumni and professionals to provide career
          support, mentorship, and skill development.
        </p>

        <div
          className="fade-up delay-3"
          style={{ display: "flex", gap: 16, justifyContent: "center" }}
        >
          <button className="btn" style={primaryBtn}>
            Get Started
          </button>
          <button className="btn" onClick={onGoLogin} style={outlineBtn}>
            Login
          </button>
        </div>
      </main>
    </div>
  );
}

const topLinkBtn = {
  border: "none",
  background: "transparent",
  color: "white",
  fontSize: 14,
  cursor: "pointer",
  opacity: 0.9,
};

const topPillBtn = {
  border: "none",
  background: "white",
  color: "#0b2a6f",
  padding: "10px 16px",
  borderRadius: 999,
  fontWeight: 400,
  cursor: "pointer",
};

const primaryBtn = {
  border: "none",
  background: "white",
  color: "#0b2a6f",
  padding: "12px 22px",
  borderRadius: 10,
  fontWeight: 500,
  fontSize: "16px",
  cursor: "pointer",
  minWidth: 140,
};

const outlineBtn = {
  border: "1px solid rgba(255,255,255,0.7)",
  background: "transparent",
  color: "white",
  padding: "12px 22px",
  borderRadius: 10,
  fontWeight: 500,
  fontSize: "16px",
  cursor: "pointer",
  minWidth: 120,
};