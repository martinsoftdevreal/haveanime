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
const VERIFICATION_KEY = 'hianimeEmailVerification';

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
    const nextUser = userData || getStoredUser();

    if (!nextUser?.emailVerified) {
      setIsLoggedIn(false);
      setUser(nextUser || null);
      return false;
    }

    localStorage.setItem(AUTH_KEY, 'true');

    if (nextUser) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(nextUser)
      );
    }

    setIsLoggedIn(true);
    setUser(nextUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(VERIFICATION_KEY);

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

  const markEmailVerified = useCallback(() => {
    const currentUser = getStoredUser();

    if (!currentUser) {
      return false;
    }

    const verifiedUser = {
      ...currentUser,
      emailVerified: true,
      verifiedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(verifiedUser)
    );
    localStorage.removeItem(VERIFICATION_KEY);
    setUser(verifiedUser);
    setIsLoggedIn(true);

    return true;
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      login,
      logout,
      updateUser,
      markEmailVerified,
    }),
    [
      isLoggedIn,
      user,
      login,
      logout,
      updateUser,
      markEmailVerified,
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