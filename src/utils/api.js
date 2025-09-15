export async function apiFetch(path, options = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jwt') : null;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(path, { ...options, headers });
  return response;
}
