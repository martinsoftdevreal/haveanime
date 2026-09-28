import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const AuthContext = createContext(null);

const AUTH_KEY = 'hianimeLoggedIn';
const USER_KEY = 'hianimeUser';

function getStoredUser() {
  try {
    const storedUser =
      localStorage.getItem(USER_KEY);

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem(AUTH_KEY) === 'true'
  );

  const [user, setUser] = useState(
    getStoredUser
  );

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

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      login,
      logout,
      updateUser,
    }),
    [
      isLoggedIn,
      user,
      login,
      logout,
      updateUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuthContext must be used inside AuthProvider'
    );
  }

  return context;
}

export default AuthContext;