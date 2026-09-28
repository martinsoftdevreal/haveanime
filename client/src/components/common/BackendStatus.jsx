import { useEffect, useState } from 'react';

import './BackendStatus.css';

function BackendStatus() {
  const [status, setStatus] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        route: 'app',
        source: 'unknown',
        url: 'pending',
      };
    }

    return window.__animeBackendInfo || {
      route: 'app',
      source: 'unknown',
      url: 'pending',
    };
  });

  useEffect(() => {
    const handleBackendChange = (event) => {
      setStatus(event.detail || {
        route: 'app',
        source: 'unknown',
        url: 'pending',
      });
    };

    window.addEventListener('anime-backend-change', handleBackendChange);

    return () => {
      window.removeEventListener('anime-backend-change', handleBackendChange);
    };
  }, []);

  const isAnimeHeaven = status.source === 'animeheaven';
  const isReady = status.source === 'hianime' || status.source === 'animeheaven';

  const backendLabel =
    status.source === 'animeheaven'
      ? 'AnimeHeaven fallback'
      : status.source === 'hianime'
        ? 'HiAnime primary'
        : 'Checking backend...';

  return (
    <div className={`backend-status backend-status--${isAnimeHeaven ? 'fallback' : isReady ? 'primary' : 'primary'}`}>
      <span className="backend-status__dot" aria-hidden="true" />
      <span className="backend-status__label">
        Active backend: <strong>{backendLabel}</strong>
      </span>
      <span className="backend-status__route">{isReady ? status.route : 'waiting for live API response'}</span>
    </div>
  );
}

export default BackendStatus;
