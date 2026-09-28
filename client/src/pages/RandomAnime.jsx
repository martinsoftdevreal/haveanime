import { useEffect, useState } from 'react';

import AnimeCard from '../components/anime/AnimeCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';

import './RandomAnime.css';

const API_BASE_URL = 'http://localhost:5000/api/v2';

async function getRandomAnimeId() {
  const response = await fetch(
    `${API_BASE_URL}/random`
  );

  if (!response.ok) {
    throw new Error(
      'Failed to get random anime.'
    );
  }

  const data = await response.json();

  const id = data?.data?.id;

  if (!id) {
    throw new Error(
      'Random API did not return an anime ID.'
    );
  }

  return String(id);
}

async function getAnimeDetails(id) {
  const response = await fetch(
    `${API_BASE_URL}/anime/${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load anime ${id}.`
    );
  }

  const data = await response.json();

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

async function fetchSixRandomAnime() {
  const uniqueIds = new Set();

  /*
   * Request more than 6 IDs because the random
   * endpoint can return the same ID more than once.
   */
  for (let attempt = 0; attempt < 15; attempt += 1) {
    if (uniqueIds.size >= 6) {
      break;
    }

    try {
      const id = await getRandomAnimeId();
      uniqueIds.add(id);
    } catch (error) {
      console.error(
        'Random ID error:',
        error
      );
    }
  }

  if (uniqueIds.size === 0) {
    throw new Error(
      'Could not get random anime IDs.'
    );
  }

  const details = await Promise.all(
    [...uniqueIds].map(async (id) => {
      try {
        return await getAnimeDetails(id);
      } catch (error) {
        console.error(
          `Failed to load anime ${id}:`,
          error
        );

        return null;
      }
    })
  );

  return details
    .filter(Boolean)
    .slice(0, 6);
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

      const results =
        await fetchSixRandomAnime();

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
              Discover 6 different random anime.
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
              : 'Get 6 Random Anime'}
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
            <section className="random-anime-grid">
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