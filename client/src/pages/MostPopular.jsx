import { useEffect, useState } from 'react';

import AnimeCard from '../components/anime/AnimeCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';

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

        const response = await fetch(
          'http://localhost:5000/api/v2/animes/most-popular'
        );

        if (!response.ok) {
          throw new Error(
            'Failed to load most popular anime.'
          );
        }

        const data = await response.json();

        const results = Array.isArray(
          data?.data?.response
        )
          ? data.data.response
          : [];

        setAnime(results);
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