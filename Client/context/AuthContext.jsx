import { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra xem user đã đăng nhập chưa khi load lại trang
  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await API.get('/auth/me'); 
          setUser(res.data);
        }
      } catch (err) {
        console.error("Chưa đăng nhập:", err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password }); 
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return res.data;
    } catch (err) { throw err; }
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password }); 
    setUser(res.data.user);
    localStorage.setItem('token', res.data.token);
    API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};