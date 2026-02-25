const API_URL = "http://localhost:5000";

export async function registerUser(payload) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function loginUser(payload) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getProfile(token) {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}