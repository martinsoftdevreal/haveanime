import { useState } from 'react';
import './AnimeCard.css';

function getHighResolutionPoster(poster) {
  if (!poster) return '';

  const url = String(poster);

  const highResolutionUrl = url.replace(
    /-\d+x\d+(?=\.(jpg|jpeg|png|webp))/i,
    ''
  );

  try {
    const parsedUrl = new URL(highResolutionUrl);

    parsedUrl.searchParams.delete('fit');
    parsedUrl.searchParams.delete('resize');

    return parsedUrl.toString();
  } catch {
    return highResolutionUrl;
  }
}

function AnimeCard({ anime }) {
  if (!anime) {
    return null;
  }

  const {
    id,
    title,
    poster,
    type,
    score,
    episodes,
  } = anime;

  const episodeCount =
    typeof episodes === 'object'
      ? episodes?.eps
      : episodes;

  const originalPoster = poster || '';

  const highResolutionPoster =
    getHighResolutionPoster(originalPoster);

  const [imageSrc, setImageSrc] = useState(
    highResolutionPoster || originalPoster
  );

  const [usedFallback, setUsedFallback] = useState(false);

  const handleImageError = () => {
    if (!usedFallback && originalPoster) {
      setUsedFallback(true);
      setImageSrc(originalPoster);
    }
  };

  return (
    <article className="anime-card">
      <a
        href={'/anime/' + id}
        className="anime-card__poster-link"
      >
        <img
          className="anime-card__poster"
          src={imageSrc}
          alt={title || 'Anime poster'}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />

        <div className="anime-card__overlay">
          {type && (
            <span className="anime-card__type">
              {type}
            </span>
          )}

          {score != null && (
            <span className="anime-card__score">
              ★ {score}
            </span>
          )}
        </div>
      </a>

      <div className="anime-card__content">
        <a
          href={'/anime/' + id}
          className="anime-card__title"
          title={title}
        >
          {title || 'Unknown Anime'}
        </a>

        <div className="anime-card__meta">
          {type && <span>{type}</span>}

          {episodeCount != null && (
            <span>{episodeCount} eps</span>
          )}
        </div>

        <div className="anime-card__badges">
          {anime.sub != null && (
            <span className="anime-card__badge anime-card__badge--sub">
              SUB {anime.sub}
            </span>
          )}

          {anime.dub != null && (
            <span className="anime-card__badge anime-card__badge--dub">
              DUB {anime.dub}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default AnimeCard;