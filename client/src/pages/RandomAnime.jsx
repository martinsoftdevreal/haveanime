import { useEffect, useState } from 'react';

import AnimeCard from '../components/anime/AnimeCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

import './RandomAnime.css';

async function getRandomAnimeId() {
  const data = await api.getRandomAnime();

  const id = data?.data?.id ?? data?.id;

  if (!id) {
    throw new Error(
      'Random API did not return an anime ID.'
    );
  }

  return String(id);
}

async function getAnimeDetails(id) {
  const data = await api.getAnime(id);

  const anime =
    data?.data?.data ??
    data?.data ??
    data;

  if (!anime || typeof anime !== 'object') {
    return null;
  }

  return {
    ...anime,
    id: anime.id ?? id,
  };
}

async function fetchSingleRandomAnime() {
  try {
    const id = await getRandomAnimeId();
    const anime = await getAnimeDetails(id);

    return anime ? [anime] : [];
  } catch (error) {
    console.error('Random anime error:', error);
    return [];
  }
}

function RandomAnime() {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRandomAnime = async () => {
    try {
      setLoading(true);
      setError('');
      setAnime([]);

      const results = await fetchSingleRandomAnime();

      if (!results.length) {
        throw new Error(
          'No random anime could be loaded.'
        );
      }

      setAnime(results);
    } catch (err) {
      console.error(
        'Random anime error:',
        err
      );

      setAnime([]);

      setError(
        err?.message ||
          'Failed to load random anime.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRandomAnime();
  }, []);

  return (
    <main className="random-anime-page">
      <div className="random-anime-container">
        <header className="random-anime-header">
          <div>
            <h1>Random Anime</h1>

            <p>
              Discover one random anime recommendation.
            </p>
          </div>

          <button
            type="button"
            className="random-anime-refresh"
            onClick={loadRandomAnime}
            disabled={loading}
          >
            {loading
              ? 'Loading...'
              : 'Get Random Anime'}
          </button>
        </header>

        {loading && (
          <Loader text="Finding random anime..." />
        )}

        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={loadRandomAnime}
          />
        )}

        {!loading &&
          !error &&
          anime.length === 0 && (
            <EmptyState
              title="No anime found"
              message="No random anime are available right now."
            />
          )}

        {!loading &&
          !error &&
          anime.length > 0 && (
            <section className="random-anime-hero">
              {anime.map((item, index) => (
                <AnimeCard
                  key={
                    item.id ??
                    `random-anime-${index}`
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

export default RandomAnime;