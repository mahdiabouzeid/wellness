import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost/wellness-backend/api', // adjust path to your PHP backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
