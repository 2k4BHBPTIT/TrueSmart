import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

console.log('🔧 Axios baseURL:', API.defaults.baseURL);

export default API;