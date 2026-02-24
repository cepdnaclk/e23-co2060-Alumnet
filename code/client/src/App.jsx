import { useState } from "react";
import { loginUser, registerUser, getProfile } from "./api";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    const data = await loginUser({ email, password });

    if (data.token) {
      localStorage.setItem("token", data.token);
      setMessage("Login successful ✅");
    } else {
      setMessage(data.message || "Login failed");
    }
  };

  const handleProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("No token found. Please login first.");
      return;
    }

    const data = await getProfile(token);
    setMessage(JSON.stringify(data, null, 2));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("Registering...");

    const data = await registerUser({
      email,
      password,
      role,
      full_name: fullName,
    });

    if (data.token) {
      localStorage.setItem("token", data.token);
      setMessage("Registered ✅ Token saved. Now click View Profile.");
    } else {
      setMessage(data.message || "Register failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", fontFamily: "Arial" }}>
      <h2>Alumnet</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <button
          type="button"
          onClick={() => setMode("login")}
          style={{ flex: 1, padding: "10px" }}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          style={{ flex: 1, padding: "10px" }}
        >
          Register
        </button>
      </div>

      <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
        {mode === "register" && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <button style={{ width: "100%", padding: "10px" }}>
          {mode === "login" ? "Login" : "Register"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleProfile}
        style={{ width: "100%", padding: "10px", marginTop: "10px" }}
      >
        View Profile (Test JWT)
      </button>

      <pre style={{ whiteSpace: "pre-wrap" }}>{message}</pre>
    </div>
  );
}

export default App;