import { useEffect } from 'react';
import { Bookmark, X } from 'lucide-react';

import { useAuthContext } from '../context/AuthContext';
import { useMedia } from '../context/MediaContext';

import EmptyState from '../components/common/EmptyState';

import './Watchlist.css';

function Watchlist() {
  const { isLoggedIn, user } = useAuthContext();
  const { watchlist, removeFromWatchlist } = useMedia();

  useEffect(() => {
    if (!isLoggedIn || !user?.emailVerified) {
      window.location.href = '/login';
    }
  }, [isLoggedIn, user]);

  if (!isLoggedIn || !user?.emailVerified) {
    return null;
  }

  return (
    <main className="watchlist-page">
      <div className="watchlist-container">
        <header className="watchlist-header">
          <div className="watchlist-header-icon">
            <Bookmark size={24} />
          </div>

          <div>
            <h1>My Watchlist</h1>
            <p>Anime you've saved for later</p>
          </div>
        </header>

        {watchlist.length === 0 ? (
          <EmptyState
            title="Your watchlist is empty"
            message="Save anime to your watchlist and they will appear here."
          />
        ) : (
          <div className="watchlist-grid">
            {watchlist.map((anime) => (
              <article
                key={anime.id}
                className="watchlist-card"
              >
                <a
                  href={`/anime/${encodeURIComponent(
                    anime.id
                  )}`}
                  className="watchlist-poster-link"
                >
                  <img
                    src={
                      anime.poster ||
                      anime.image ||
                      anime.cover ||
                      'https://via.placeholder.com/300x420?text=Anime'
                    }
                    alt={anime.title || 'Anime poster'}
                    loading="lazy"
                    className="watchlist-poster"
                  />
                </a>

                <div className="watchlist-card-body">
                  <div className="watchlist-card-meta">
                    <h2>{anime.title || 'Untitled Anime'}</h2>
                    <button
                      type="button"
                      className="watchlist-remove"
                      onClick={() =>
                        removeFromWatchlist(
                          anime.id
                        )
                      }
                      aria-label={`Remove ${anime.title || 'anime'} from watchlist`}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {anime.genre && (
                    <p className="watchlist-genre">
                      {anime.genre}
                    </p>
                  )}

                  <a
                    href={`/anime/${encodeURIComponent(
                      anime.id
                    )}`}
                    className="watchlist-link"
                  >
                    View details
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Watchlist;