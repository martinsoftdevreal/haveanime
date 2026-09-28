import { useEffect, useState } from 'react';

import AnimeCard from '../components/anime/AnimeCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

import './Genres.css';

function Genres({ genre = '' }) {
  const [genres, setGenres] = useState([]);
  const [anime, setAnime] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isGenrePage = Boolean(genre);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        if (isGenrePage) {
          const data = await api.fetchWithFallback(
            [`/animes/genre/${encodeURIComponent(genre)}?page=1`, `/anime/genre/${encodeURIComponent(genre)}?page=1`],
            'genres-page'
          );

          const results = Array.isArray(
            data?.data?.response
          )
            ? data.data.response
            : Array.isArray(data?.data)
              ? data.data
              : [];

          setAnime(results);
          return;
        }

        const data = await api.getGenres();

        const results = Array.isArray(data?.data)
          ? data.data
          : [];

        setGenres(results);
      } catch (err) {
        console.error('Genres page error:', err);

        setGenres([]);
        setAnime([]);

        setError(
          err?.message ||
            'Failed to load genre data.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [genre, isGenrePage]);

  if (loading) {
    return (
      <main className="genres-page">
        <div className="genres-container">
          <Loader
            text={
              isGenrePage
                ? `Loading ${genre} anime...`
                : 'Loading genres...'
            }
          />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="genres-page">
        <div className="genres-container">
          <ErrorMessage message={error} />
        </div>
      </main>
    );
  }

  if (isGenrePage) {
    return (
      <main className="genres-page">
        <div className="genres-container">
          <header className="genres-header">
            <h1>
              {genre.charAt(0).toUpperCase() +
                genre.slice(1)}{' '}
              Anime
            </h1>

            <p>
              Browse anime in the{' '}
              {genre.toLowerCase()} genre.
            </p>
          </header>

          {anime.length === 0 ? (
            <EmptyState
              title="No anime found"
              message={`No anime were found in the ${genre} genre.`}
            />
          ) : (
            <section className="genres-anime-grid">
              {anime.map((item, index) => (
                <AnimeCard
                  key={
                    item?.id ??
                    `genre-${genre}-${index}`
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

  return (
    <main className="genres-page">
      <div className="genres-container">
        <header className="genres-header">
          <h1>Genres</h1>
          <p>
            Explore anime by genre.
          </p>
        </header>

        {genres.length === 0 ? (
          <EmptyState
            title="No genres found"
            message="No anime genres are currently available."
          />
        ) : (
          <section className="genres-list">
            {genres.map((item) => {
              const name =
                typeof item === 'string'
                  ? item
                  : item?.name;

              if (!name) {
                return null;
              }

              const slug = name
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '-');

              return (
                <a
                  key={name}
                  href={`/anime/genre/${encodeURIComponent(
                    slug
                  )}`}
                  className="genre-card"
                >
                  <span>{name}</span>
                </a>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

export default Genres;