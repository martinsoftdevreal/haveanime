import { useEffect, useState } from 'react';

import AnimeCard from '../components/anime/AnimeCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';

import './Genres.css';

const API_BASE_URL = 'http://localhost:5000/api/v2';

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
          const response = await fetch(
            `${API_BASE_URL}/animes/genre/${encodeURIComponent(
              genre
            )}?page=1`
          );

          if (!response.ok) {
            throw new Error(
              'Failed to load anime for this genre.'
            );
          }

          const data = await response.json();

          const results = Array.isArray(
            data?.data?.response
          )
            ? data.data.response
            : [];

          setAnime(results);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/genres`
        );

        if (!response.ok) {
          throw new Error('Failed to load genres.');
        }

        const data = await response.json();

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