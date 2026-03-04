// code/client/src/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data; // { token }
}

export async function registerUser(full_name, role, email, password) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, role, email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Register failed");
  return data; // { token }
}

export async function getProfile(token) {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Profile fetch failed");
  return data;
}