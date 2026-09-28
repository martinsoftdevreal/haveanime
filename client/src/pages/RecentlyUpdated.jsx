import { useEffect, useState } from 'react';

import AnimeCard from '../components/anime/AnimeCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

import './RecentlyUpdated.css';

function RecentlyUpdated() {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecentlyUpdated = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await api.fetchWithFallback(
          ['/animes/recently-updated', '/recently-updated'],
          'recently-updated'
        );

        const results = Array.isArray(data?.data?.response)
          ? data.data.response
          : Array.isArray(data?.data)
            ? data.data
            : [];

        setAnime(results);
      } catch (err) {
        console.error('Recently updated error:', err);
        setAnime([]);
        setError('Failed to load recently updated anime.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyUpdated();
  }, []);

  return (
    <main className="recently-updated-page">
      <div className="recently-updated-container">
        <header className="recently-updated-header">
          <h1>Recently Updated</h1>
          <p>Anime with the latest episode updates</p>
        </header>

        {loading && <Loader />}

        {!loading && error && (
          <ErrorMessage message={error} />
        )}

        {!loading && !error && anime.length === 0 && (
          <EmptyState
            title="No anime found"
            message="No recently updated anime are available right now."
          />
        )}

        {!loading && !error && anime.length > 0 && (
          <section className="recently-updated-grid">
            {anime.map((item, index) => (
              <AnimeCard
                key={item?.id ?? `recently-updated-${index}`}
                anime={item}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default RecentlyUpdated;