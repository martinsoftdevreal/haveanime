
import { useCallback, useEffect, useState } from 'react';

import './AnimeDetails.css';

import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

import api from '../services/api';

function AnimeDetails({ animeId }) {
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPage = useCallback(async () => {
    if (!animeId) {
      setAnime(null);
      setEpisodes([]);
      setError('Anime ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setAnime(null);
    setEpisodes([]);

    try {
      const animeResponse =
        await api.getAnime(animeId);

      console.log(
        'Anime details API response:',
        animeResponse
      );

      const animeData =
        animeResponse?.data?.response ??
        animeResponse?.data ??
        animeResponse?.response ??
        animeResponse;

      if (
        !animeData ||
        typeof animeData !== 'object' ||
        Array.isArray(animeData)
      ) {
        throw new Error(
          'Anime details were not returned by the server.'
        );
      }

      setAnime(animeData);

      /*
       * Episodes are fetched only internally so that
       * the existing Watch Now button can still use
       * the first available episode.
       *
       * Episodes are NOT displayed on this page.
       */

      const numericAnimeId = Number(
        animeData?.id
      );

      if (
        !Number.isFinite(numericAnimeId) ||
        numericAnimeId <= 0
      ) {
        return;
      }

      try {
        const episodesResponse =
          await api.getEpisodes(
            numericAnimeId
          );

        console.log(
          'Episodes API response:',
          episodesResponse
        );

        let episodesData = [];

        if (
          Array.isArray(
            episodesResponse?.data
          )
        ) {
          episodesData =
            episodesResponse.data;
        } else if (
          Array.isArray(
            episodesResponse?.data?.response
          )
        ) {
          episodesData =
            episodesResponse.data.response;
        } else if (
          Array.isArray(
            episodesResponse?.response
          )
        ) {
          episodesData =
            episodesResponse.response;
        } else if (
          Array.isArray(episodesResponse)
        ) {
          episodesData =
            episodesResponse;
        }

        setEpisodes(episodesData);
      } catch (episodeError) {
        /*
         * Episode failure must NOT prevent the
         * anime details and seasons from showing.
         */

        console.error(
          'Episodes loading error:',
          episodeError
        );

        setEpisodes([]);
      }
    } catch (animeError) {
      console.error(
        'Anime details loading error:',
        animeError
      );

      setAnime(null);

      setError(
        animeError?.message ||
          'Failed to load anime details.'
      );
    } finally {
      setLoading(false);
    }
  }, [animeId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!animeId) {
        if (!cancelled) {
          setAnime(null);
          setEpisodes([]);
          setError('Anime ID is required');
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError('');
      setAnime(null);
      setEpisodes([]);

      try {
        const animeResponse =
          await api.getAnime(animeId);

        if (cancelled) {
          return;
        }

        console.log(
          'Anime details API response:',
          animeResponse
        );

        const animeData =
          animeResponse?.data?.response ??
          animeResponse?.data ??
          animeResponse?.response ??
          animeResponse;

        if (
          !animeData ||
          typeof animeData !== 'object' ||
          Array.isArray(animeData)
        ) {
          throw new Error(
            'Anime details were not returned by the server.'
          );
        }

        setAnime(animeData);

        /*
         * Fetch episodes internally only for
         * the Watch Now button.
         */

        const numericAnimeId = Number(
          animeData?.id
        );

        if (
          !Number.isFinite(numericAnimeId) ||
          numericAnimeId <= 0
        ) {
          return;
        }

        try {
          const episodesResponse =
            await api.getEpisodes(
              numericAnimeId
            );

          if (cancelled) {
            return;
          }

          console.log(
            'Episodes API response:',
            episodesResponse
          );

          let episodesData = [];

          if (
            Array.isArray(
              episodesResponse?.data
            )
          ) {
            episodesData =
              episodesResponse.data;
          } else if (
            Array.isArray(
              episodesResponse?.data?.response
            )
          ) {
            episodesData =
              episodesResponse.data.response;
          } else if (
            Array.isArray(
              episodesResponse?.response
            )
          ) {
            episodesData =
              episodesResponse.response;
          } else if (
            Array.isArray(episodesResponse)
          ) {
            episodesData =
              episodesResponse;
          }

          setEpisodes(episodesData);
        } catch (episodeError) {
          if (cancelled) {
            return;
          }

          console.error(
            'Episodes loading error:',
            episodeError
          );

          setEpisodes([]);
        }
      } catch (animeError) {
        if (cancelled) {
          return;
        }

        console.error(
          'Anime details loading error:',
          animeError
        );

        setAnime(null);

        setError(
          animeError?.message ||
            'Failed to load anime details.'
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [animeId]);

  if (loading) {
    return (
      <main className="anime-details">
        <div className="anime-details__loading">
          <Loader text="Loading anime details..." />
        </div>
      </main>
    );
  }

  if (error || !anime) {
    return (
      <main className="anime-details">
        <div className="anime-details__error">
          <ErrorMessage
            message={
              error ||
              'Anime details are not available.'
            }
            onRetry={loadPage}
          />
        </div>
      </main>
    );
  }

  const {
    title,
    alternativeTitle,
    poster,
    type,
    quality,
    duration,
    aired,
    status,
    synopsis,
    episodes: episodeInfo,
    genres,
    id,
    moreSeasons,
  } = anime;

  const formatAired = (value) => {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const from = value.from || '';
      const to = value.to || '';

      if (from && to) {
        return from + ' - ' + to;
      }

      return from || to;
    }

    return String(value);
  };

  const formatValue = (value) => {
    if (value == null) {
      return '';
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number'
    ) {
      return String(value);
    }

    if (typeof value === 'object') {
      if (value.name) {
        return value.name;
      }

      if (value.title) {
        return value.title;
      }

      if (value.value != null) {
        return String(value.value);
      }

      return '';
    }

    return String(value);
  };

  const airedText = formatAired(aired);
  const typeText = formatValue(type);
  const qualityText = formatValue(quality);
  const durationText = formatValue(duration);
  const statusText = formatValue(status);

  const genreList = Array.isArray(genres)
    ? genres
        .map((genre) => formatValue(genre))
        .filter(Boolean)
    : [];

  /*
   * ------------------------------------------------------
   * SEASONS
   * ------------------------------------------------------
   */

  const seasons = Array.isArray(moreSeasons)
    ? moreSeasons.filter(
        (season) => season?.id
      )
    : [];

  const currentId = String(
    id || animeId
  );

  const normalizedSeasons = seasons.map(
    (season) => ({
      ...season,
      id: String(season.id),
    })
  );

  const currentExists =
    normalizedSeasons.some(
      (season) =>
        String(season.id) === currentId
    );

  if (!currentExists) {
    normalizedSeasons.unshift({
      id: currentId,
      title:
        title ||
        alternativeTitle ||
        'Current Season',
      poster,
      year: airedText,
      isActive: true,
    });
  }

  const seasonList = [];
  const seenSeasonIds = new Set();

  normalizedSeasons.forEach((season) => {
    const seasonId = String(
      season.id
    );

    if (seenSeasonIds.has(seasonId)) {
      return;
    }

    seenSeasonIds.add(seasonId);

    seasonList.push({
      ...season,
      isActive:
        seasonId === currentId ||
        Boolean(season.isActive),
    });
  });

  /*
   * First episode is used ONLY for Watch Now.
   * It is never displayed in the details page.
   */

  const firstEpisode = episodes[0];

  const firstEpisodeId =
    firstEpisode?.id ??
    firstEpisode?.episodeId ??
    firstEpisode?.episode_id;

  const animeRouteId = id || animeId;

  return (
    <main className="anime-details">
      {/* HERO */}
      <section className="anime-details__backdrop">
        {poster && (
          <img
            className="anime-details__backdrop-image"
            src={poster}
            alt=""
            aria-hidden="true"
          />
        )}

        <div className="anime-details__backdrop-overlay" />

        <div className="anime-details__hero">
          {poster && (
            <div className="anime-details__poster-wrapper">
              <img
                className="anime-details__poster"
                src={poster}
                alt={
                  title ||
                  'Anime poster'
                }
              />
            </div>
          )}

          <div className="anime-details__info">
            <h1 className="anime-details__title">
              {title || 'Unknown Anime'}
            </h1>

            {alternativeTitle &&
              alternativeTitle !== title && (
                <p className="anime-details__alternative-title">
                  {alternativeTitle}
                </p>
              )}

            <div className="anime-details__meta">
              {typeText && (
                <span className="anime-details__meta-item">
                  {typeText}
                </span>
              )}

              {qualityText && (
                <span className="anime-details__meta-item anime-details__meta-item--badge">
                  {qualityText}
                </span>
              )}

              {durationText && (
                <span className="anime-details__meta-item">
                  {durationText}
                </span>
              )}

              {airedText && (
                <span className="anime-details__meta-item">
                  {airedText}
                </span>
              )}

              {statusText && (
                <span className="anime-details__meta-item">
                  {statusText}
                </span>
              )}

              {episodeInfo?.sub != null && (
                <span className="anime-details__meta-item">
                  SUB {episodeInfo.sub}
                </span>
              )}

              {episodeInfo?.dub != null && (
                <span className="anime-details__meta-item">
                  DUB {episodeInfo.dub}
                </span>
              )}
            </div>

            {synopsis && (
              <p className="anime-details__synopsis">
                {synopsis}
              </p>
            )}

            <div className="anime-details__actions">
              <a
                href={
                  firstEpisodeId
                    ? `/watch/${encodeURIComponent(
                        animeRouteId
                      )}/${encodeURIComponent(
                        firstEpisodeId
                      )}`
                    : '#'
                }
                className="anime-details__button anime-details__button--primary"
                aria-disabled={
                  !firstEpisodeId
                }
                onClick={(event) => {
                  if (!firstEpisodeId) {
                    event.preventDefault();
                  }
                }}
              >
                ▶ Watch Now
              </a>

              <a
                href="/"
                className="anime-details__button anime-details__button--secondary"
              >
                ← Back Home
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="anime-details__content">
        {/* SEASONS ONLY */}
        {seasonList.length > 0 && (
          <section className="anime-details__section">
            <div className="anime-details__section-heading">
              <div>
                <span className="anime-details__section-label">
                  RELATED
                </span>

                <h2 className="anime-details__section-title">
                  Seasons
                </h2>
              </div>

              <span className="anime-details__season-count">
                {seasonList.length}{' '}
                {seasonList.length === 1
                  ? 'Season'
                  : 'Seasons'}
              </span>
            </div>

            <div className="anime-details__seasons">
              {seasonList.map((season) => {
                const seasonId =
                  String(season.id);

                const isActive =
                  season.isActive ||
                  seasonId ===
                    String(animeId) ||
                  seasonId ===
                    String(id);

                const seasonTitle =
                  season.title ||
                  season.name ||
                  season.alternativeTitle ||
                  'Season';

                return (
                  <a
                    key={seasonId}
                    href={`/anime/${encodeURIComponent(
                      seasonId
                    )}`}
                    className={`anime-details__season ${
                      isActive
                        ? 'anime-details__season--active'
                        : ''
                    }`}
                    aria-current={
                      isActive
                        ? 'page'
                        : undefined
                    }
                  >
                    <div className="anime-details__season-image-wrapper">
                      {season.poster ? (
                        <img
                          className="anime-details__season-poster"
                          src={season.poster}
                          alt={seasonTitle}
                          loading="lazy"
                        />
                      ) : (
                        <div className="anime-details__season-poster anime-details__season-poster--empty">
                          <span>
                            {seasonTitle.charAt(
                              0
                            )}
                          </span>
                        </div>
                      )}

                      {isActive && (
                        <span className="anime-details__season-badge">
                          Current
                        </span>
                      )}
                    </div>

                    <span className="anime-details__season-info">
                      <span className="anime-details__season-title">
                        {seasonTitle}
                      </span>

                      {season.year && (
                        <span className="anime-details__season-year">
                          {season.year}
                        </span>
                      )}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* GENRES */}
        {genreList.length > 0 && (
          <section className="anime-details__section">
            <h2 className="anime-details__section-title">
              Genres
            </h2>

            <div className="anime-details__genres">
              {genreList.map(
                (genre, index) => (
                  <a
                    key={`${genre}-${index}`}
                    href={`/anime/genre/${encodeURIComponent(
                      genre
                        .trim()
                        .toLowerCase()
                        .replace(
                          /\s+/g,
                          '-'
                        )
                    )}`}
                    className="anime-details__genre"
                  >
                    {genre}
                  </a>
                )
              )}
            </div>
          </section>
        )}

        {/* INFORMATION */}
        <section className="anime-details__section">
          <h2 className="anime-details__section-title">
            Information
          </h2>

          <div className="anime-details__info-grid">
            {typeText && (
              <div className="anime-details__info-item">
                <span className="anime-details__info-label">
                  Type
                </span>

                <span className="anime-details__info-value">
                  {typeText}
                </span>
              </div>
            )}

            {qualityText && (
              <div className="anime-details__info-item">
                <span className="anime-details__info-label">
                  Quality
                </span>

                <span className="anime-details__info-value">
                  {qualityText}
                </span>
              </div>
            )}

            {durationText && (
              <div className="anime-details__info-item">
                <span className="anime-details__info-label">
                  Duration
                </span>

                <span className="anime-details__info-value">
                  {durationText}
                </span>
              </div>
            )}

            {airedText && (
              <div className="anime-details__info-item">
                <span className="anime-details__info-label">
                  Aired
                </span>

                <span className="anime-details__info-value">
                  {airedText}
                </span>
              </div>
            )}

            {statusText && (
              <div className="anime-details__info-item">
                <span className="anime-details__info-label">
                  Status
                </span>

                <span className="anime-details__info-value">
                  {statusText}
                </span>
              </div>
            )}

            {episodeInfo?.sub != null && (
              <div className="anime-details__info-item">
                <span className="anime-details__info-label">
                  Sub Episodes
                </span>

                <span className="anime-details__info-value">
                  {episodeInfo.sub}
                </span>
              </div>
            )}

            {episodeInfo?.dub != null && (
              <div className="anime-details__info-item">
                <span className="anime-details__info-label">
                  Dub Episodes
                </span>

                <span className="anime-details__info-value">
                  {episodeInfo.dub}
                </span>
              </div>
            )}

            {episodeInfo?.eps != null && (
              <div className="anime-details__info-item">
                <span className="anime-details__info-label">
                  Total Episodes
                </span>

                <span className="anime-details__info-value">
                  {episodeInfo.eps}
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AnimeDetails;

