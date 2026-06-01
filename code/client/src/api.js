const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return handle(res);
}

export async function registerUser(payload) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handle(res);
}

export async function getProfile(token) {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function updateProfile(token, payload) {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  return handle(res);
}

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

export async function getDirectory(search = "", department = "") {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.append("search", search.trim());
  }

  if (department.trim()) {
    params.append("department", department.trim());
  }

  const query = params.toString();

  const res = await fetch(
    `${API_URL}/api/directory${query ? `?${query}` : ""}`
  );

  return handle(res);
}

export async function getAlumniProfile(id) {
  const res = await fetch(`${API_URL}/api/directory/${id}`);
  return handle(res);
}

export async function createMentorshipRequest(token, payload) {
  const res = await fetch(`${API_URL}/api/mentorship-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  return handle(res);
}

export async function getStudentRequests(token) {
  const res = await fetch(`${API_URL}/api/mentorship-requests/student`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function getMentorRequests(token) {
  const res = await fetch(`${API_URL}/api/mentorship-requests/mentor`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function updateMentorshipRequest(token, id, status) {
  const res = await fetch(`${API_URL}/api/mentorship-requests/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ status }),
  });

  return handle(res);
}

export async function getMyMentors(token) {
  const res = await fetch(`${API_URL}/api/mentorship-requests/my-mentors`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function getMyMentees(token) {
  const res = await fetch(`${API_URL}/api/mentorship-requests/my-mentees`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function getEvents() {
  const res = await fetch(`${API_URL}/api/events`);
  return handle(res);
}

export async function createEvent(token, payload) {
  const res = await fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  return handle(res);
}

export async function getPendingEvents(token) {
  const res = await fetch(`${API_URL}/api/events/pending`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function approveEvent(token, id) {
  const res = await fetch(`${API_URL}/api/events/approve/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function rejectEvent(token, id) {
  const res = await fetch(`${API_URL}/api/events/reject/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function registerForEvent(token, eventId) {
  const res = await fetch(`${API_URL}/api/events/${eventId}/register`, {
    method: "POST",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function getMyRegisteredEvents(token) {
  const res = await fetch(`${API_URL}/api/events/my-registrations`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function getEventById(id) {
  const res = await fetch(`${API_URL}/api/events/${id}`);
  return handle(res);
}