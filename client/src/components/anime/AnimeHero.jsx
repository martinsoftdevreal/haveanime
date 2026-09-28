import { useEffect, useState } from 'react';

import './AnimeHero.css';

function AnimeHero({ spotlight = [] }) {
  const slides = spotlight.slice(0, 5);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setActiveIndex((currentIndex) => (
        (currentIndex + 1) % slides.length
      ));
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  if (!slides.length) {
    return null;
  }

  const anime = slides[activeIndex];

  const {
    title,
    alternativeTitle,
    poster,
    quality,
    type,
    duration,
    aired,
    synopsis,
    episodes,
    id,
  } = anime;

  return (
    <section className="anime-hero">
      <div className="anime-hero__slide anime-hero__slide--active">
        {poster && (
          <img
            className="anime-hero__backdrop"
            src={poster}
            alt=""
            aria-hidden="true"
          />
        )}

        <div className="anime-hero__overlay" />
      </div>

      <div className="anime-hero__content">
        <div className="anime-hero__info">
          <span className="anime-hero__label">
            #{activeIndex + 1} Spotlight
          </span>

          <h1 className="anime-hero__title">
            {title || 'Featured Anime'}
          </h1>

          {alternativeTitle && alternativeTitle !== title && (
            <p className="anime-hero__alternative-title">
              {alternativeTitle}
            </p>
          )}

          <div className="anime-hero__meta">
            {type && (
              <span className="anime-hero__meta-item">
                {type}
              </span>
            )}

            {quality && (
              <span className="anime-hero__meta-item anime-hero__meta-item--quality">
                {quality}
              </span>
            )}

            {duration && (
              <span className="anime-hero__meta-item">
                {duration}
              </span>
            )}

            {aired && (
              <span className="anime-hero__meta-item">
                {aired}
              </span>
            )}

            {episodes?.sub != null && (
              <span className="anime-hero__meta-item">
                SUB {episodes.sub}
              </span>
            )}

            {episodes?.dub != null && (
              <span className="anime-hero__meta-item">
                DUB {episodes.dub}
              </span>
            )}
          </div>

          {synopsis && (
            <p className="anime-hero__synopsis">
              {synopsis}
            </p>
          )}

          <div className="anime-hero__actions">
           <a
              href={`/anime/${encodeURIComponent(id)}`}
              className="anime-hero__button anime-hero__button--primary"
                >
             ▶ Watch Now
            </a>

            <a
              href={`/anime/${encodeURIComponent(id)}`}
              className="anime-hero__button anime-hero__button--secondary"
            >
              More Details
            </a>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div
          className="anime-hero__indicators"
          aria-label="Spotlight slides"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id || index}
              type="button"
              className={`anime-hero__indicator ${
                index === activeIndex
                  ? 'anime-hero__indicator--active'
                  : ''
              }`}
              aria-label={`Show spotlight ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default AnimeHero;