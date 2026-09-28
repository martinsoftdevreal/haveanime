import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuthContext } from './AuthContext';

const MediaContext = createContext(null);

function getCurrentUser() {
  try {
    const storedUser =
      localStorage.getItem('hianimeUser');

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    return null;
  }
}

function getUserKey(user) {
  return user?.email
    ? `hianimeWatchlist_${user.email.toLowerCase()}`
    : 'hianimeWatchlist_guest';
}

export function MediaProvider({ children }) {
  const { user, isLoggedIn } = useAuthContext();

  const [watchlist, setWatchlist] = useState(() => {
    const currentUser = getCurrentUser();
    const key = getUserKey(currentUser);

    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const stored =
        localStorage.getItem(
          'hianimeFavorites'
        );

      return stored
        ? JSON.parse(stored)
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!isLoggedIn || !user?.emailVerified) {
      setWatchlist([]);
      return;
    }

    const key = getUserKey(user);

    try {
      const stored = localStorage.getItem(key);
      setWatchlist(stored ? JSON.parse(stored) : []);
    } catch {
      setWatchlist([]);
    }
  }, [isLoggedIn, user]);

  const addToWatchlist = useCallback((anime) => {
    if (!anime?.id || !isLoggedIn || !user?.emailVerified) {
      return false;
    }

    const key = getUserKey(user);

    setWatchlist((current) => {
      const exists = current.some(
        (item) =>
          String(item.id) ===
          String(anime.id)
      );

      if (exists) {
        return current;
      }

      const updated = [
        ...current,
        {
          ...anime,
          id: String(anime.id),
        },
      ];

      localStorage.setItem(
        key,
        JSON.stringify(updated)
      );

      return updated;
    });

    return true;
  }, [isLoggedIn, user]);

  const removeFromWatchlist = useCallback(
    (animeId) => {
      if (!isLoggedIn || !user?.emailVerified) {
        return false;
      }

      const key = getUserKey(user);

      setWatchlist((current) => {
        const updated = current.filter(
          (item) =>
            String(item.id) !==
            String(animeId)
        );

        localStorage.setItem(
          key,
          JSON.stringify(updated)
        );

        return updated;
      });

      return true;
    },
    [isLoggedIn, user]
  );

  const isInWatchlist = useCallback(
    (animeId) => {
      return watchlist.some(
        (item) =>
          String(item.id) ===
          String(animeId)
      );
    },
    [watchlist]
  );

  const addToFavorites = useCallback((anime) => {
    if (!anime?.id) {
      return;
    }

    setFavorites((current) => {
      const exists = current.some(
        (item) =>
          String(item.id) ===
          String(anime.id)
      );

      if (exists) {
        return current;
      }

      const updated = [
        ...current,
        anime,
      ];

      localStorage.setItem(
        'hianimeFavorites',
        JSON.stringify(updated)
      );

      return updated;
    });
  }, []);

  const removeFromFavorites = useCallback(
    (animeId) => {
      setFavorites((current) => {
        const updated = current.filter(
          (item) =>
            String(item.id) !==
            String(animeId)
        );

        localStorage.setItem(
          'hianimeFavorites',
          JSON.stringify(updated)
        );

        return updated;
      });
    },
    []
  );

  const isFavorite = useCallback(
    (animeId) => {
      return favorites.some(
        (item) =>
          String(item.id) ===
          String(animeId)
      );
    },
    [favorites]
  );

  const value = useMemo(
    () => ({
      watchlist,
      favorites,

      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,

      addToFavorites,
      removeFromFavorites,
      isFavorite,
    }),
    [
      watchlist,
      favorites,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
    ]
  );

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);

  if (!context) {
    throw new Error(
      'useMedia must be used inside MediaProvider'
    );
  }

  return context;
}

export default MediaContext;