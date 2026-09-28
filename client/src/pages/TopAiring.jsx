import { useEffect, useState } from 'react';

import AnimeCard from '../components/anime/AnimeCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

import './TopAiring.css';

function TopAiring() {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopAiring = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await api.getTopAiring();

        const results = Array.isArray(data?.data?.response)
          ? data.data.response
          : Array.isArray(data?.data)
            ? data.data
            : [];

        setAnime(results.slice(0, 8));
      } catch (err) {
        console.error('Top airing error:', err);
        setAnime([]);
        setError('Failed to load top airing anime.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopAiring();
  }, []);

  return (
    <main className="top-airing-page">
      <div className="top-airing-container">
        <header className="top-airing-header">
          <h1>Top Airing Anime</h1>
          <p>Currently airing popular anime</p>
        </header>

        {loading && <Loader />}

        {!loading && error && (
          <ErrorMessage message={error} />
        )}

        {!loading && !error && anime.length === 0 && (
          <EmptyState
            title="No anime found"
            message="No top airing anime are available right now."
          />
        )}

        {!loading && !error && anime.length > 0 && (
          <section className="top-airing-grid">
            {anime.map((item, index) => (
              <AnimeCard
                key={item?.id ?? `top-airing-${index}`}
                anime={item}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default TopAiring;