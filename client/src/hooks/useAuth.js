import { useCallback, useState } from 'react';

const AUTH_KEY = 'hianimeLoggedIn';
const USER_KEY = 'hianimeUser';

function getStoredUser() {
  try {
    const user = localStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem(AUTH_KEY) === 'true'
  );

  const [user, setUser] = useState(getStoredUser);

  const login = useCallback((userData = null) => {
    localStorage.setItem(AUTH_KEY, 'true');

    if (userData) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(userData)
      );
    }

    setIsLoggedIn(true);
    setUser(userData || getStoredUser());
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);

    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    if (!userData) {
      return;
    }

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(userData)
    );

    setUser(userData);
  }, []);

  return {
    isLoggedIn,
    user,
    login,
    logout,
    updateUser,
  };
}

export default useAuth;