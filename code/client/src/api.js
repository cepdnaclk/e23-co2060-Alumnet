// code/client/src/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// AUTH
export async function loginUser({ email, password }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res); // { token }
}

export async function registerUser(payload) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res); // { token, profile? }
}

export async function getProfile(token) {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });
  return handle(res);
}

// PROFILE UPDATE
export async function updateProfile(token, payload) {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// ADMIN
export async function getPendingUsers(token) {
  const res = await fetch(`${API_URL}/api/auth/admin/pending`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });
  return handle(res);
}

export async function verifyUser(token, userId) {
  const res = await fetch(`${API_URL}/api/auth/admin/verify/${userId}`, {
    method: "PATCH",
    headers: { ...authHeaders(token) },
  });
  return handle(res);
}