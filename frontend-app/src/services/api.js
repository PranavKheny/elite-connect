// src/services/api.js

// Base URL
const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:8080";
export { BASE_URL };

/** Unified request helper (handles 204/205 + JSON fallback) */
async function request(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204 || res.status === 205) return null;

  const read = async () => {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  };

  const data = await read();
  if (!res.ok) {
    const msg = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(`${res.status} ${res.statusText} – ${msg}`);
  }
  return data;
}

/* =========================
   AUTH & CURRENT USER
   ========================= */
async function login(username, password) {
  const data = await request("/api/users/login", {
    method: "POST",
    body: { username, password },
  });
  const token = data?.jwtToken || data?.token;
  if (!token) throw new Error("Login succeeded but no token was returned.");
  return token;
}

async function getMe(token) {
  return request("/api/users/me", { token });
}

/* =========================
   MATCHES
   ========================= */
async function fetchMatchesOf(userId, token) {
  // GET /matches/of/{id} -> [{ id, username }, ...]
  const data = await request(`/matches/of/${userId}`, { token });
  return Array.isArray(data) ? data : (data?.value ?? []);
}

/* =========================
   CONNECTION REQUESTS
   ========================= */
async function sendConnectionRequest(receiverId, token) {
  // POST /api/users/{receiverId}/connect
  await request(`/api/users/${receiverId}/connect`, {
    method: "POST",
    token,
  });
  return true;
}

async function acceptConnection(requestId, token) {
  // PUT /api/users/connections/{requestId}/accept
  const data = await request(`/api/users/connections/${requestId}/accept`, {
    method: "PUT",
    token,
  });
  return data ?? { id: requestId, status: "ACCEPTED" };
}

async function declineConnection(requestId, token) {
  // PUT /api/users/connections/{requestId}/decline
  await request(`/api/users/connections/${requestId}/decline`, {
    method: "PUT",
    token,
  });
  return true;
}

async function getReceivedConnections(token) {
  // GET /api/users/connections/received
  return request(`/api/users/connections/received`, { token });
}

async function getSentConnectionIds(token) {
  // GET /api/users/connections/sentIds -> [userIds...]
  const data = await request(`/api/users/connections/sentIds`, { token });
  return Array.isArray(data) ? data : (data?.value ?? []);
}

/* =========================
   LIKES
   ========================= */
async function likeUser(receiverId, token) {
  // POST /api/users/{receiverId}/like
  await request(`/api/users/${receiverId}/like`, {
    method: "POST",
    token,
  });
  return true;
}

async function getReceivedLikes(token) {
  // GET /api/users/likes/received
  return request(`/api/users/likes/received`, { token });
}

async function getSentLikeIds(token) {
  // GET /api/users/likes/sentIds -> [userIds...]
  const data = await request(`/api/users/likes/sentIds`, { token });
  return Array.isArray(data) ? data : (data?.value ?? []);
}

/* =========================
   USERS (dashboard browse)
   ========================= */
async function getUsers({ page = 0, size = 10 } = {}, token) {
  // GET /api/users?page=&size=  (returns array; pagination in headers)
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(`${BASE_URL}/api/users?page=${page}&size=${size}`, { headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch users (${res.status}): ${text}`);
  }

  const items = await res.json();
  return {
    items: Array.isArray(items) ? items : [],
    totalCount: Number(res.headers.get("X-Total-Count") || 0),
    totalPages: Number(res.headers.get("X-Total-Pages") || 0),
  };
}

/* =========================
   MESSAGES
   ========================= */
async function sendMessage(receiverId, content, token) {
  // POST /api/messages/{receiverId}
  return request(`/api/messages/${receiverId}`, {
    method: "POST",
    token,
    body: { content },
  });
}

async function getConversation(otherUserId, { page = 0, size = 20 } = {}, token) {
  // GET /api/messages/{otherUserId}?page=&size=&sort=createdAt,desc
  return request(
    `/api/messages/${otherUserId}?page=${page}&size=${size}&sort=createdAt,desc`,
    { token }
  );
}

/* =========================
   Named exports
   ========================= */
export {
  request,
  login,
  getMe,
  fetchMatchesOf,
  sendConnectionRequest,
  acceptConnection,
  declineConnection,
  getReceivedConnections,
  getSentConnectionIds,
  likeUser,
  getReceivedLikes,
  getSentLikeIds,
  getUsers,
  sendMessage,
  getConversation,
};

/* =========================
   Default export (for modules importing default)
   ========================= */
const api = {
  BASE_URL,
  request,
  login,
  getMe,
  fetchMatchesOf,
  sendConnectionRequest,
  acceptConnection,
  declineConnection,
  getReceivedConnections,
  getSentConnectionIds,
  likeUser,
  getReceivedLikes,
  getSentLikeIds,
  getUsers,
  sendMessage,
  getConversation,
};

export default api;
