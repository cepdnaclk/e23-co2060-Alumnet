import { useState } from "react";
import { loginUser, registerUser, getProfile } from "./api";
import Navbar from "./components/Navbar";
import EditProfile from "./pages/EditProfile";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("login"); 
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  // Role 2: State to switch between Auth and Profile view
  const [view, setView] = useState("auth"); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");
    const data = await loginUser({ email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
      setMessage("Login successful ✅");
      setView("profile"); // Role 2: Switch to profile view after login
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
      setMessage("Registered ✅ Token saved.");
      setView("profile"); // Role 2: Switch to profile view after register
    } else {
      setMessage(data.message || "Register failed");
    }
  };

  return (
    <div>
      {/* Role 2: Navbar now stays at the top of every page */}
      <Navbar />
      
      <div style={{ maxWidth: "600px", margin: "50px auto", fontFamily: "Arial" }}>
        
        {/* Toggle between Auth forms and Edit Profile */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button onClick={() => setView("auth")} style={{ marginRight: "10px" }}>Auth View</button>
          <button onClick={() => setView("profile")}>Edit Profile View</button>
        </div>

        <hr />

        {view === "auth" ? (
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <h2>Alumnet Auth</h2>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <button onClick={() => setMode("login")} style={{ flex: 1, padding: "10px" }}>Login</button>
              <button onClick={() => setMode("register")} style={{ flex: 1, padding: "10px" }}>Register</button>
            </div>

            <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
              {mode === "register" && (
                <>
                  <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px" }} />
                  <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px" }}>
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </>
              )}
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px" }} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px" }} />
              <button style={{ width: "100%", padding: "10px" }}>{mode === "login" ? "Login" : "Register"}</button>
            </form>
            
            <button onClick={handleProfile} style={{ width: "100%", padding: "10px", marginTop: "10px" }}>View Profile (Test JWT)</button>
            <pre style={{ whiteSpace: "pre-wrap", background: "#f4f4f4", padding: "10px" }}>{message}</pre>
          </div>
        ) : (
          /* Role 2: Show your Edit Profile module */
          <EditProfile />
        )}
      </div>
    </div>
  );
}

export default App;