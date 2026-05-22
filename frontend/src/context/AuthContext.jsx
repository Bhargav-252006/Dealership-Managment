import React, {createContext, useContext, useState, useEffect} from 'react';
import API from '../api';

const AuthContext = createContext();

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      API.get('/me/').then(({data}) => setUser(data)).catch(() => {
        localStorage.clear();
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const {data} = await API.post('/token/', {username, password});
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    const profile = await API.get('/me/');
    setUser(profile.data);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const impersonate = async (targetUserId) => {
    const { data } = await API.post('/admin/impersonate', { userId: targetUserId });
    const currentToken = localStorage.getItem('access');
    localStorage.setItem('adminToken', currentToken);
    localStorage.setItem('access', data.token);
    const profile = await API.get('/me/');
    setUser(profile.data);
  };

  const stopImpersonating = async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      localStorage.setItem('access', adminToken);
      localStorage.removeItem('adminToken');
      const profile = await API.get('/me/');
      setUser(profile.data);
    }
  };

  return (
    <AuthContext.Provider value={{user, login, logout, loading, impersonate, stopImpersonating}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
