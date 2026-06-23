import axios from 'axios';

const authAPI = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  withCredentials: true
});

const loadsAPI = axios.create({
  baseURL: import.meta.env.VITE_LOADS_URL,
  withCredentials: true
});

const trackingAPI = axios.create({
  baseURL: import.meta.env.VITE_TRACKING_URL,
  withCredentials: true
});

const documentsAPI = axios.create({
  baseURL: import.meta.env.VITE_DOCUMENTS_URL,
  withCredentials: true
});

// Add JWT token to every request automatically
const addAuthInterceptor = (api) => {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

addAuthInterceptor(authAPI);
addAuthInterceptor(loadsAPI);
addAuthInterceptor(trackingAPI);
addAuthInterceptor(documentsAPI);

export { authAPI, loadsAPI, trackingAPI, documentsAPI };