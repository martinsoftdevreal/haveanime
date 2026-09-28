import { useEffect, useMemo, useRef, useState } from 'react';

import './AnimeGrid.css';
import AnimeCard from './AnimeCard';

const BATCH_SIZE = 12;

function AnimeGrid({ anime = [] }) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(Math.min(BATCH_SIZE, anime.length || BATCH_SIZE));
  }, [anime.length]);

  const visibleAnime = useMemo(
    () => anime.slice(0, visibleCount),
    [anime, visibleCount]
  );

  useEffect(() => {
    if (visibleCount >= anime.length || !sentinelRef.current) {
      return undefined;
    }

    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((current) =>
            Math.min(current + BATCH_SIZE, anime.length)
          );
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [anime.length, visibleCount]);

  if (!anime.length) {
    return null;
  }

  return (
    <div className="anime-grid">
      {visibleAnime.map((item) => (
        <AnimeCard
          key={item.id}
          anime={item}
        />
      ))}

      {visibleCount < anime.length && (
        <div
          ref={sentinelRef}
          className="anime-grid__sentinel"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default AnimeGrid;