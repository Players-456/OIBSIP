import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');

    if (userString && userString !== 'undefined') {
      const user = JSON.parse(userString);

      if (user.token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${user.token}`,
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;