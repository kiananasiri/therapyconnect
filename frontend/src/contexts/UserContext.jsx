import React, { createContext, useState, useContext, useEffect } from "react";
import { getCurrentUser, isAuthenticated } from "../api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeUser = () => {
      try {
        if (isAuthenticated()) {
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
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
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
  };

  const logout = async () => {
    try {
      // Clear tokens and user data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Update context
      setUser(null);
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
    isAuthenticated: isAuthenticated()
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

