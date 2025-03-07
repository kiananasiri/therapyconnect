import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import defaultAvatar from '../assets/avatar.png';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    avatar: defaultAvatar,
    name: '',
    email: '',
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      // Fetch user data from backend
      fetch('http://localhost:8000/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setUser(prev => ({
          ...prev,
          name: data.username,
          email: data.email,
          isAuthenticated: true,
        }));
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
        Cookies.remove('authToken');
      });
    }
  }, []);

  const updateAvatar = (newAvatar) => {
    setUser(prev => ({
      ...prev,
      avatar: newAvatar
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateAvatar }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 