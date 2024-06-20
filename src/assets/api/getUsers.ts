const API_BASE_URL = 'http://localhost:8080'; 

const handleResponse = async (response: any | void) => {
  const data = await response.json();
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }
  return data;
};

export const login = async (credentials: any | void) => {
  const response = await fetch(`${API_BASE_URL}/user_ess/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(response);
};

export const fetchProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(response);
};
