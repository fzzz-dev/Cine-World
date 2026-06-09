import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cineblood_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Axios sets Content-Type: application/json by default on all POST/PUT
    // requests. When sending FormData we must DELETE it so the browser sets
    // it automatically with the correct multipart boundary, e.g.:
    //   multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
    // Without the boundary multer cannot parse the body and returns 400.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cineblood_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;