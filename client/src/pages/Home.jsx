
import { useEffect, useState } from 'react';

import './Home.css';

import AnimeHero from '../components/anime/AnimeHero';
import AnimeGrid from '../components/anime/AnimeGrid';

import AdBanner from '../components/common/AdBanner';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';

import api from '../services/api';

function Home() {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHome = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.getHome();

      const data = response?.data?.data ?? response?.data ?? response;

      setHomeData(data || {});
    } catch (err) {
      console.error('Home page error:', err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load home page'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHome();
  }, []);

  if (loading) {
    return (
      <main className="home">
        <div className="home__content">
          <Loader text="Loading anime..." />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="home">
        <div className="home__content">
          <ErrorMessage
            message={error}
            onRetry={loadHome}
          />
        </div>
      </main>
    );
  }

  const spotlight = Array.isArray(homeData?.spotlight)
    ? homeData.spotlight
    : [];

  const topAiring = Array.isArray(homeData?.topAiring)
    ? homeData.topAiring
    : [];

  const trending = Array.isArray(homeData?.trending)
    ? homeData.trending
    : [];

  const mostPopular = Array.isArray(homeData?.mostPopular)
    ? homeData.mostPopular
    : [];

  const hasAnime =
    spotlight.length > 0 ||
    topAiring.length > 0 ||
    trending.length > 0 ||
    mostPopular.length > 0;

  if (!hasAnime) {
    return (
      <main className="home">
        <div className="home__content">
          <EmptyState
            title="No anime available"
            message="There is currently no anime data to display."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="home">
      {spotlight.length > 0 && (
        <AnimeHero spotlight={spotlight} />
      )}

      <div className="home__content">
        {topAiring.length > 0 && (
          <section className="home__section">
            <div className="home__section-header">
              <h2 className="home__section-title">
                Top Airing
              </h2>

              <a
                href="/top-airing"
                className="home__section-link"
              >
                View All
              </a>
            </div>

            <AnimeGrid anime={topAiring} />
          </section>
        )}

        {topAiring.length > 0 && trending.length > 0 && (
          <AdBanner />
        )}

        {trending.length > 0 && (
          <section className="home__section">
            <div className="home__section-header">
              <h2 className="home__section-title">
                Trending
              </h2>

              <a
                href="/trending"
                className="home__section-link"
              >
                View All
              </a>
            </div>

            <AnimeGrid anime={trending} />
          </section>
        )}

        {trending.length > 0 && mostPopular.length > 0 && (
          <AdBanner />
        )}

        {mostPopular.length > 0 && (
          <section className="home__section">
            <div className="home__section-header">
              <h2 className="home__section-title">
                Most Popular
              </h2>

              <a
                href="/most-popular"
                className="home__section-link"
              >
                View All
              </a>
            </div>

            <AnimeGrid anime={mostPopular} />
          </section>
        )}

        {mostPopular.length > 0 && (
          <AdBanner />
        )}
      </div>
    </main>
  );
}

export default Home;

