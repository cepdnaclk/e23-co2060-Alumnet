import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api";

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
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 12 }}>Login</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Use your Alumnet account to continue.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 6 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{ width: "100%", padding: 10, marginBottom: 14 }}
        />

        <label style={{ display: "block", marginBottom: 6 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          style={{ width: "100%", padding: 10, marginBottom: 14 }}
        />

        {error && (
          <div
            style={{
              background: "rgba(255,0,0,0.08)",
              border: "1px solid rgba(255,0,0,0.2)",
              padding: 10,
              borderRadius: 8,
              marginBottom: 12,
              color: "#b00020",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={{ marginTop: 14, opacity: 0.85 }}>
        Don’t have an account? <Link to="/register">Register</Link>
      </div>

      <div style={{ marginTop: 10 }}>
        <Link to="/">← Back to Home</Link>
      </div>
    </div>
  );
}