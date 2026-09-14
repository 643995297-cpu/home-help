const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    let msg = `请求失败 (${res.status})`;
    try { msg = (await res.json()).error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  getHouse: (id) => request(`/houses/${id}`),
  createHouse: (body) => request('/houses', { method: 'POST', body }),
  joinHouse: (body) => request('/houses/join', { method: 'POST', body }),
  addRoommate: (houseId, body) => request(`/houses/${houseId}/roommates`, { method: 'POST', body }),

  addExpense: (houseId, body) => request(`/houses/${houseId}/expenses`, { method: 'POST', body }),
  deleteExpense: (houseId, eid) => request(`/houses/${houseId}/expenses/${eid}`, { method: 'DELETE' }),

  addTask: (houseId, body) => request(`/houses/${houseId}/tasks`, { method: 'POST', body }),
  toggleTask: (houseId, tid) => request(`/houses/${houseId}/tasks/${tid}`, { method: 'PATCH' }),
  deleteTask: (houseId, tid) => request(`/houses/${houseId}/tasks/${tid}`, { method: 'DELETE' }),

  addItem: (houseId, body) => request(`/houses/${houseId}/items`, { method: 'POST', body }),
  useItem: (houseId, iid, body) => request(`/houses/${houseId}/items/${iid}/use`, { method: 'POST', body }),
  restockItem: (houseId, iid, body) => request(`/houses/${houseId}/items/${iid}/restock`, { method: 'POST', body }),
  deleteItem: (houseId, iid) => request(`/houses/${houseId}/items/${iid}`, { method: 'DELETE' }),

  addRule: (houseId, body) => request(`/houses/${houseId}/rules`, { method: 'POST', body }),
  voteRule: (houseId, rid, body) => request(`/houses/${houseId}/rules/${rid}/vote`, { method: 'POST', body }),
  deleteRule: (houseId, rid) => request(`/houses/${houseId}/rules/${rid}`, { method: 'DELETE' }),
};
