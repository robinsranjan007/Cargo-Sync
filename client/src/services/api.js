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

// Auto refresh token on 401
const addRefreshInterceptor = (api) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const response = await authAPI.post('/refresh')
          const { accessToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('accessToken')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )
}

addRefreshInterceptor(loadsAPI)
addRefreshInterceptor(trackingAPI)
addRefreshInterceptor(documentsAPI)

export { authAPI, loadsAPI, trackingAPI, documentsAPI };