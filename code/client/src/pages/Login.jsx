// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api";
import AuthLayout from "../components/AuthLayout";
import {
  titleStyle,
  labelStyle,
  inputStyle,
  btnPrimaryStyle,
  footerRowStyle,
  linkStyle,
  errorBoxStyle,
} from "../styles/ui";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout maxWidth={420}>
      <h1 style={titleStyle}>Login</h1>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="james.potter@example.com"
          required
          autoComplete="email"
          style={inputStyle}
        />

        <label style={labelStyle}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
          required
          autoComplete="current-password"
          style={inputStyle}
        />

        {error && <div style={errorBoxStyle}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="btnPrimary"
          style={{
            ...btnPrimaryStyle,
            opacity: loading ? 0.8 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={footerRowStyle}>
        Don’t have an account?{" "}
        <Link className="link" style={linkStyle} to="/register">
          Register
        </Link>
      </div>

      <div style={{ textAlign: "center", marginTop: 10 }}>
        <Link className="link" style={linkStyle} to="/">
          ← Back to Home
        </Link>
      </div>
    </AuthLayout>
  );
}