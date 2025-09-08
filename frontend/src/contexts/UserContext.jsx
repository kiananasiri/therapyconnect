import React, { createContext, useState, useContext, useEffect } from "react";
import { getCurrentUser, isAuthenticated } from "../api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeUser = () => {
      try {
        const authenticated = isAuthenticated();
        setIsAuth(authenticated);
        
        if (authenticated) {
          const userData = getCurrentUser();
          if (userData) {
            setUser({
              ...userData,
              role: 'therapist' // Since we're handling therapist login
            });
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        // Clear invalid data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    // Handle token expiration events from API interceptor
    const handleTokenExpired = () => {
      console.log('Token expired event received, logging out user');
      setUser(null);
      setIsAuth(false);
    };

    initializeUser();
    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const login = (userData, tokens) => {
    // Store tokens
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Update context
    setUser({
      ...userData,
      role: 'therapist'
    });
    setIsAuth(true);
  };

  const logout = async () => {
    try {
      // Clear tokens and user data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Update context
      setUser(null);
      setIsAuth(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: isAuth
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

