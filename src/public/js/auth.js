const API_URL = "/auth";

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function removeToken() {
  localStorage.removeItem("token");
}

function isAuthenticated() {
  return !!getToken();
}

function redirectIfAuthenticated() {
  if (isAuthenticated()) window.location.href = "/app.html";
}

function redirectIfNotAuthenticated() {
  if (!isAuthenticated()) window.location.href = "/login.html";
}

async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message);

  setToken(data.token);
  window.location.href = "/app.html";
}

async function register(email, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message);

  await login(email, password);
}

function logout() {
  removeToken();
  window.location.href = "/login.html";
}

async function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}