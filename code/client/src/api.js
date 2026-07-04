const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

async function handleWithFallback(primaryRequest, fallbackRequest) {
  const primary = await primaryRequest();

  if (primary.status !== 404 || !fallbackRequest) {
    return handle(primary);
  }

  return handle(await fallbackRequest());
}

async function handleFirstAvailable(requests) {
  let lastResponse;

  for (const request of requests) {
    const response = await request();
    if (response.status !== 404) {
      return handle(response);
    }
    lastResponse = response;
  }

  return handle(lastResponse);
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

export async function verifyEmail(token) {
  const res = await fetch(`${API_URL}/api/auth/verify-email/${token}`, {
    method: "GET",
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

  if (search.trim()) params.append("search", search.trim());
  if (department.trim()) params.append("department", department.trim());

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

export async function getEventById(token, id) {
  const res = await fetch(`${API_URL}/api/events/${id}`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });

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

export async function getAdminEventStats(token) {
  const res = await fetch(`${API_URL}/api/events/admin/stats`, {
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

export async function getChatContacts(token) {
  const res = await fetch(`${API_URL}/api/chat/contacts`, {
    headers: {
      ...authHeaders(token),
    },
  });

  return handle(res);
}

export async function getConversations(token) {
  const res = await fetch(`${API_URL}/api/chat/conversations`, {
    headers: {
      ...authHeaders(token),
    },
  });

  return handle(res);
}

export async function getConversationMessages(token, conversationId) {
  const res = await fetch(
    `${API_URL}/api/chat/conversations/${conversationId}/messages`,
    {
      headers: {
        ...authHeaders(token),
      },
    }
  );

  return handle(res);
}

export async function sendMessage(token, conversationId, payload) {
  const res = await fetch(
    `${API_URL}/api/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify(
        typeof payload === "string" ? { message_text: payload } : payload
      ),
    }
  );

  return handle(res);
}

export async function deleteChatMessage(token, messageId) {
  const res = await fetch(`${API_URL}/api/chat/messages/${messageId}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(token),
    },
  });

  return handle(res);
}

export async function getMyNotifications(token) {
  const res = await fetch(`${API_URL}/api/notifications`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function markNotificationAsRead(token, notificationId) {
  const res = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}

export async function getAdminStats(token) {
  return handleWithFallback(
    () =>
      fetch(`${API_URL}/api/admin/stats`, {
        method: "GET",
        headers: { ...authHeaders(token) },
      }),
    () =>
      fetch(`${API_URL}/api/auth/admin/stats`, {
        method: "GET",
        headers: { ...authHeaders(token) },
      })
  );
}

export async function getAdminPendingUsers(token) {
  return handleFirstAvailable([
    () =>
      fetch(`${API_URL}/api/admin/pending-users`, {
        method: "GET",
        headers: { ...authHeaders(token) },
      }),
    () =>
      fetch(`${API_URL}/api/auth/admin/pending-users`, {
        method: "GET",
        headers: { ...authHeaders(token) },
      }),
    () =>
      fetch(`${API_URL}/api/auth/admin/pending`, {
        method: "GET",
        headers: { ...authHeaders(token) },
      }),
  ]);
}

export async function verifyUserStatus(token, id, status) {
  return handleWithFallback(
    () =>
      fetch(`${API_URL}/api/admin/verify-user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify({ status }),
      }),
    () =>
      fetch(`${API_URL}/api/auth/admin/verify-user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify({ status }),
      })
  );
}

export async function getMyCreatedEvents(token) {
  const res = await fetch(`${API_URL}/api/events/my-created`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });

  return handle(res);
}
