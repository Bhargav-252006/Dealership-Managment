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

  return (
    <AuthContext.Provider value={{user, login, logout, loading}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
