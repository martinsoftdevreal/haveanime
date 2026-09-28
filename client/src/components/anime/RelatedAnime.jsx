import { useEffect, useState } from 'react';

import AnimeCard from './AnimeCard';
import AdBanner from '../common/AdBanner';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';

import './RelatedAnime.css';

const API_BASE_URL = 'http://localhost:5000/api/v2';

function normalizeGenre(genre) {
  if (typeof genre === 'string') {
    return genre.trim();
  }

  return genre?.name?.trim?.() || '';
}

function RelatedAnime({ genres = [], currentAnimeId }) {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRelatedAnime = async () => {
      const firstGenre = genres
        .map(normalizeGenre)
        .find(Boolean);

      if (!firstGenre) {
        setAnime([]);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/animes/genre/${encodeURIComponent(
            firstGenre.toLowerCase().replace(/\s+/g, '-')
          )}?page=1`
        );

        if (!response.ok) {
          throw new Error(
            'Failed to load related anime.'
          );
        }

        const data = await response.json();

        const results = Array.isArray(
          data?.data?.response
        )
          ? data.data.response
          : [];

        const filtered = results
          .filter(
            (item) =>
              String(item?.id) !==
              String(currentAnimeId)
          )
          .slice(0, 12);

        setAnime(filtered);
      } catch (error) {
        console.error(
          'Related anime error:',
          error
        );

        setAnime([]);
      } finally {
        setLoading(false);
      }
    };

    loadRelatedAnime();
  }, [genres, currentAnimeId]);

  if (!genres.length) {
    return null;
  }

  return (
    <section className="related-anime">
      <AdBanner />

      <div className="related-anime__header">
        <div>
          <h2>Related Anime</h2>

          <p>
            More anime from the same genre
          </p>
        </div>
      </div>

      {loading && (
        <Loader text="Loading related anime..." />
      )}

      {!loading && anime.length === 0 && (
        <EmptyState
          title="No related anime"
          message="No related anime were found for this genre."
        />
      )}

      {!loading && anime.length > 0 && (
        <>
          <div className="related-anime__grid">
            {anime.slice(0, 6).map((item, index) => (
              <AnimeCard
                key={
                  item?.id ??
                  `related-anime-${index}`
                }
                anime={item}
              />
            ))}
          </div>

          {anime.length > 6 && (
            <>
              <AdBanner />

              <div className="related-anime__grid">
                {anime.slice(6, 12).map((item, index) => (
                  <AnimeCard
                    key={
                      item?.id ??
                      `related-anime-more-${index}`
                    }
                    anime={item}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

export default RelatedAnime;