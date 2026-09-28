
import { useEffect, useMemo, useState } from 'react';

import api from '../services/api';

import EpisodeList from '../components/anime/EpisodeList';
import RelatedAnime from '../components/anime/RelatedAnime';

import ServerSelector from '../components/player/ServerSelector';
import VideoPlayer from '../components/player/VideoPlayer';

import './Watch.css';

function Watch({ animeId, episodeId }) {
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);

  const [loadingAnime, setLoadingAnime] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [loadingServers, setLoadingServers] = useState(false);

  const [error, setError] = useState('');

  /*
   * Convert the anime ID into the numeric ID required
   * by the episodes endpoint.
   */
  const numericAnimeId = useMemo(() => {
    if (!anime) {
      return null;
    }

    const possibleIds = [
      anime.id,
      anime.animeId,
      anime.anilistId,
      anime.malId,
      anime.numericId,
    ];

    for (const value of possibleIds) {
      const number = Number(value);

      if (Number.isFinite(number) && number > 0) {
        return number;
      }
    }

    return null;
  }, [anime]);

  /*
   * Load anime details.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadAnime() {
      if (!animeId) {
        setError('Anime ID is missing.');
        setLoadingAnime(false);
        return;
      }

      try {
        setLoadingAnime(true);
        setError('');

        const response = await api.getAnime(animeId);

        if (cancelled) {
          return;
        }

        const data = response?.data ?? response;

        setAnime(data);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error('Failed to load anime:', err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load anime details.'
        );
      } finally {
        if (!cancelled) {
          setLoadingAnime(false);
        }
      }
    }

    loadAnime();

    return () => {
      cancelled = true;
    };
  }, [animeId]);

  /*
   * Load episodes after we know the numeric anime ID.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadEpisodes() {
      if (!numericAnimeId) {
        setEpisodes([]);
        setLoadingEpisodes(false);
        return;
      }

      try {
        setLoadingEpisodes(true);

        const response =
          await api.getEpisodes(numericAnimeId);

        if (cancelled) {
          return;
        }

        const data = response?.data ?? response;

        let episodeData = [];

        if (Array.isArray(data)) {
          episodeData = data;
        } else if (Array.isArray(data?.episodes)) {
          episodeData = data.episodes;
        } else if (Array.isArray(data?.data)) {
          episodeData = data.data;
        }

        setEpisodes(episodeData);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          'Failed to load episodes:',
          err
        );

        setEpisodes([]);
      } finally {
        if (!cancelled) {
          setLoadingEpisodes(false);
        }
      }
    }

    loadEpisodes();

    return () => {
      cancelled = true;
    };
  }, [numericAnimeId]);

  /*
   * Load servers for the selected episode.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadServers() {
      if (!episodeId) {
        setServers([]);
        setSelectedServer(null);
        setLoadingServers(false);
        return;
      }

      try {
        setLoadingServers(true);
        setServers([]);
        setSelectedServer(null);

        const response =
          await api.getEpisodeServers(episodeId);

        if (cancelled) {
          return;
        }

        const data = response?.data ?? response;

        let serverData = [];

        if (Array.isArray(data)) {
          serverData = data;
        } else if (Array.isArray(data?.servers)) {
          serverData = data.servers;
        } else if (Array.isArray(data?.data)) {
          serverData = data.data;
        }

        setServers(serverData);

        /*
         * Automatically select the first available server.
         */
        if (serverData.length > 0) {
          setSelectedServer(serverData[0]);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          'Failed to load episode servers:',
          err
        );

        setServers([]);
        setSelectedServer(null);
      } finally {
        if (!cancelled) {
          setLoadingServers(false);
        }
      }
    }

    loadServers();

    return () => {
      cancelled = true;
    };
  }, [episodeId]);

  /*
   * Find the currently selected episode.
   */
  const currentEpisode = useMemo(() => {
    if (!episodes.length || !episodeId) {
      return null;
    }

    return (
      episodes.find((episode) => {
        const id =
          episode?.id ??
          episode?.episodeId ??
          episode?.episode_id;

        return String(id) === String(episodeId);
      }) || null
    );
  }, [episodes, episodeId]);

  /*
   * Decode the selected server hash into the actual
   * external player URL.
   */
  const videoSource = useMemo(() => {
    if (!selectedServer) {
      return '';
    }

    const hash =
      selectedServer.hash ??
      selectedServer.url ??
      selectedServer.src ??
      '';

    if (!hash) {
      return '';
    }

    /*
     * If the server already provides a normal URL,
     * use it directly.
     */
    if (
      typeof hash === 'string' &&
      (hash.startsWith('http://') ||
        hash.startsWith('https://'))
    ) {
      return hash;
    }

    /*
     * Otherwise decode the Base64 hash.
     */
    try {
      const decoded = atob(hash);

      console.log(
        'Selected server:',
        selectedServer
      );

      console.log(
        'Decoded stream URL:',
        decoded
      );

      return decoded;
    } catch (err) {
      console.error(
        'Failed to decode server hash:',
        err
      );

      return '';
    }
  }, [selectedServer]);

  /*
   * Server selection.
   */
  const handleServerSelect = (server) => {
    setSelectedServer(server);
  };

  /*
   * Loading state for the whole page.
   */
  if (loadingAnime) {
    return (
      <main className="watch-page">
        <div className="watch-page__container">
          <div className="watch-page__loading">
            <div className="watch-page__spinner" />
            <p>Loading anime...</p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Error state.
   */
  if (error && !anime) {
    return (
      <main className="watch-page">
        <div className="watch-page__container">
          <div className="watch-page__error">
            <div className="watch-page__error-icon">
              !
            </div>

            <h2>Unable to load anime</h2>

            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  const animeTitle =
    anime?.title ||
    anime?.name ||
    anime?.titleEnglish ||
    'Anime';

  const episodeNumber =
    currentEpisode?.episodeNumber ??
    currentEpisode?.number ??
    currentEpisode?.episode ??
    '';

  /*
   * Get the current anime genres.
   */
  const animeGenres = Array.isArray(anime?.genres)
    ? anime.genres
    : [];

  /*
   * Only use seasons actually returned by the API.
   *
   * If:
   *   moreSeasons: []
   *
   * then the Seasons section will not be rendered.
   */
  const availableSeasons = Array.isArray(
    anime?.moreSeasons
  )
    ? anime.moreSeasons.filter(
        (season) => season?.id
      )
    : [];

  return (
    <main className="watch-page">
      <div className="watch-page__container">
        {/* =========================
            PAGE HEADER
        ========================== */}

        <header className="watch-page__header">
          <div className="watch-page__breadcrumb">
            <a href="/">Home</a>

            <span>/</span>

            <a href={`/anime/${animeId}`}>
              {animeTitle}
            </a>

            <span>/</span>

            <span>
              {episodeNumber
                ? `Episode ${episodeNumber}`
                : 'Watch'}
            </span>
          </div>

          <h1 className="watch-page__title">
            {animeTitle}

            {episodeNumber
              ? ` - Episode ${episodeNumber}`
              : ''}
          </h1>
        </header>

        {/* =========================
            WATCH AREA
            PLAYER LEFT
            EPISODES RIGHT
        ========================== */}

        <section className="watch-page__watch-area">
          {/* LEFT COLUMN */}

          <div className="watch-page__main">
            <div className="watch-page__player-wrapper">
              <VideoPlayer
                src={videoSource}
                title={`${animeTitle} ${
                  episodeNumber
                    ? `Episode ${episodeNumber}`
                    : ''
                }`}
              />
            </div>

            {/* SERVERS STAY UNDER PLAYER */}

            <div className="watch-page__servers">
              {loadingServers ? (
                <div className="watch-page__servers-loading">
                  <span className="watch-page__small-spinner" />

                  <span>
                    Loading servers...
                  </span>
                </div>
              ) : servers.length > 0 ? (
                <ServerSelector
                  servers={servers}
                  selectedServer={selectedServer}
                  onSelect={handleServerSelect}
                />
              ) : (
                <div className="watch-page__no-servers">
                  No streaming servers are available
                  for this episode.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}

          <aside className="watch-page__episodes">
            {/* =========================
                AVAILABLE SEASONS
                ONLY SHOW IF AVAILABLE
            ========================== */}

            {availableSeasons.length > 0 && (
              <div className="watch-page__seasons">
                <div className="watch-page__seasons-header">
                  <div>
                    <h2>Seasons</h2>

                    <span>
                      {availableSeasons.length}{' '}
                      {availableSeasons.length === 1
                        ? 'season'
                        : 'seasons'}
                    </span>
                  </div>
                </div>

                <div className="watch-page__seasons-list">
                  {availableSeasons.map(
                    (season, index) => {
                      const seasonId =
                        String(season.id);

                      const seasonTitle =
                        season.title ||
                        season.name ||
                        season.alternativeTitle ||
                        `Season ${index + 1}`;

                      const isCurrent =
                        seasonId ===
                        String(animeId);

                      return (
                        <a
                          key={seasonId}
                          href={`/anime/${encodeURIComponent(
                            seasonId
                          )}`}
                          className={`watch-page__season ${
                            isCurrent
                              ? 'watch-page__season--active'
                              : ''
                          }`}
                        >
                          {season.poster && (
                            <img
                              src={season.poster}
                              alt={seasonTitle}
                              className="watch-page__season-poster"
                              loading="lazy"
                            />
                          )}

                          <span className="watch-page__season-info">
                            <span className="watch-page__season-title">
                              {seasonTitle}
                            </span>

                            {season.year && (
                              <span className="watch-page__season-year">
                                {season.year}
                              </span>
                            )}
                          </span>

                          {isCurrent && (
                            <span className="watch-page__season-badge">
                              Current
                            </span>
                          )}
                        </a>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* =========================
                EPISODES
            ========================== */}

            <div className="watch-page__episodes-header">
              <div>
                <h2>Episodes</h2>

                <span>
                  {episodes.length > 0
                    ? `${episodes.length} episodes`
                    : 'Episodes'}
                </span>
              </div>
            </div>

            <div className="watch-page__episodes-body">
              {loadingEpisodes ? (
                <div className="watch-page__episodes-loading">
                  <div className="watch-page__small-spinner" />

                  <p>Loading episodes...</p>
                </div>
              ) : episodes.length > 0 ? (
                <EpisodeList
                  episodes={episodes}
                  currentEpisodeId={episodeId}
                  animeId={animeId}
                />
              ) : (
                <div className="watch-page__episodes-empty">
                  <p>No episodes available.</p>
                </div>
              )}
            </div>
          </aside>
        </section>

        {/* =========================
            RELATED ANIME
            SAME GENRE
            ADVERTISEMENTS INCLUDED
        ========================== */}

        <RelatedAnime
          genres={animeGenres}
          currentAnimeId={animeId}
        />
      </div>
    </main>
  );
}

export default Watch;

