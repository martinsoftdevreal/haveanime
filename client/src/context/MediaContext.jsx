import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const MediaContext = createContext(null);

export function MediaProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored =
        localStorage.getItem(
          'hianimeWatchlist'
        );

      return stored
        ? JSON.parse(stored)
        : [];
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

  const addToWatchlist = useCallback((anime) => {
    if (!anime?.id) {
      return;
    }

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
        anime,
      ];

      localStorage.setItem(
        'hianimeWatchlist',
        JSON.stringify(updated)
      );

      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback(
    (animeId) => {
      setWatchlist((current) => {
        const updated = current.filter(
          (item) =>
            String(item.id) !==
            String(animeId)
        );

        localStorage.setItem(
          'hianimeWatchlist',
          JSON.stringify(updated)
        );

        return updated;
      });
    },
    []
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