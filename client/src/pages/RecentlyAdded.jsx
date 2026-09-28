import { useEffect, useState } from 'react';

import AnimeCard from '../components/anime/AnimeCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

import './RecentlyAdded.css';

function RecentlyAdded() {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecentlyAdded = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await api.fetchWithFallback(
          ['/animes/recently-added', '/recently-added'],
          'recently-added'
        );

        const results = Array.isArray(data?.data?.response)
          ? data.data.response
          : Array.isArray(data?.data)
            ? data.data
            : [];

        setAnime(results);
      } catch (err) {
        console.error('Recently added error:', err);
        setAnime([]);
        setError('Failed to load recently added anime.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyAdded();
  }, []);

  return (
    <main className="recently-added-page">
      <div className="recently-added-container">
        <header className="recently-added-header">
          <h1>Recently Added</h1>
          <p>Latest anime added to the catalog</p>
        </header>

        {loading && <Loader />}

        {!loading && error && (
          <ErrorMessage message={error} />
        )}

        {!loading && !error && anime.length === 0 && (
          <EmptyState
            title="No anime found"
            message="No recently added anime are available right now."
          />
        )}

        {!loading && !error && anime.length > 0 && (
          <section className="recently-added-grid">
            {anime.map((item, index) => (
              <AnimeCard
                key={item?.id ?? `recently-added-${index}`}
                anime={item}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default RecentlyAdded;