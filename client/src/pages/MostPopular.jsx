import { useEffect, useState } from 'react';

import AnimeCard from '../components/anime/AnimeCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

import './MostPopular.css';

function MostPopular() {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMostPopular = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await api.getMostPopular();

        const results = Array.isArray(
          data?.data?.response
        )
          ? data.data.response
          : Array.isArray(data?.data)
            ? data.data
            : [];

        setAnime(results.slice(0, 8));
      } catch (err) {
        console.error('Most popular error:', err);
        setAnime([]);
        setError(
          'Failed to load most popular anime.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMostPopular();
  }, []);

  return (
    <main className="most-popular-page">
      <div className="most-popular-container">
        <header className="most-popular-header">
          <h1>Most Popular Anime</h1>
          <p>
            The most popular anime on HiAnime
          </p>
        </header>

        {loading && <Loader />}

        {!loading && error && (
          <ErrorMessage message={error} />
        )}

        {!loading &&
          !error &&
          anime.length === 0 && (
            <EmptyState
              title="No anime found"
              message="No popular anime are available right now."
            />
          )}

        {!loading &&
          !error &&
          anime.length > 0 && (
            <section className="most-popular-grid">
              {anime.map((item, index) => (
                <AnimeCard
                  key={
                    item?.id ??
                    `most-popular-${index}`
                  }
                  anime={item}
                />
              ))}
            </section>
          )}
      </div>
    </main>
  );
}

export default MostPopular;