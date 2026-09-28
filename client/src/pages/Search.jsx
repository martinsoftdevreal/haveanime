import {
  useEffect,
  useState,
} from 'react';

import {
  Search as SearchIcon,
} from 'lucide-react';

import AnimeCard from '../components/anime/AnimeCard';

import './Search.css';

function Search() {
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');

  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const urlKeyword =
      params.get('keyword')?.trim() || '';

    setKeyword(urlKeyword);
    setInputValue(urlKeyword);
  }, []);

  useEffect(() => {
    const searchAnime = async () => {
      if (!keyword) {
        setAnime([]);
        setError('');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/v2/search?keyword=${encodeURIComponent(
            keyword
          )}`
        );

        if (!response.ok) {
          throw new Error(
            'Failed to fetch search results'
          );
        }

        const data = await response.json();

        setAnime(
          Array.isArray(data?.data?.response)
            ? data.data.response
            : []
        );
      } catch (err) {
        console.error('Search error:', err);

        setAnime([]);
        setError(
          'Failed to load search results.'
        );
      } finally {
        setLoading(false);
      }
    };

    searchAnime();
  }, [keyword]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const searchKeyword = inputValue.trim();

    if (!searchKeyword) {
      return;
    }

    window.location.href = `/search?keyword=${encodeURIComponent(
      searchKeyword
    )}`;
  };

  return (
    <main className="search-page">
      <div className="search-container">
        <form
          className="search-form"
          onSubmit={handleSubmit}
        >
          <div className="search-input-wrapper">
            <SearchIcon
              className="search-input-icon"
              size={20}
              strokeWidth={2}
              aria-hidden="true"
            />

            <input
              id="search-anime"
              name="keyword"
              className="search-input"
              type="search"
              value={inputValue}
              onChange={(event) =>
                setInputValue(event.target.value)
              }
              placeholder="Search anime..."
              aria-label="Search anime"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            className="search-button"
            aria-label="Search anime"
          >
            <SearchIcon
              size={19}
              strokeWidth={2}
              aria-hidden="true"
            />

            <span>Search</span>
          </button>
        </form>

        {!keyword ? (
          <div className="search-empty">
            <SearchIcon
              size={42}
              strokeWidth={1.5}
              aria-hidden="true"
            />

            <h2>Search Anime</h2>

            <p>
              Enter an anime name to search.
            </p>
          </div>
        ) : (
          <>
            <header className="search-header">
              <h1 className="search-title">
                Search results for{' '}
                <span className="search-keyword">
                  "{keyword}"
                </span>
              </h1>
            </header>

            {loading && (
              <div className="search-loading">
                <p>Searching...</p>
              </div>
            )}

            {error && (
              <div className="search-error">
                <p>{error}</p>
              </div>
            )}

            {!loading &&
              !error &&
              anime.length === 0 && (
                <div className="search-empty">
                  <SearchIcon
                    size={42}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />

                  <h2>No anime found</h2>

                  <p>
                    We couldn't find any anime
                    matching "{keyword}".
                  </p>
                </div>
              )}

            {!loading &&
              !error &&
              anime.length > 0 && (
                <section className="search-results">
                  {anime.map((item, index) => (
                    <AnimeCard
                      key={
                        item?.id ??
                        `search-result-${index}`
                      }
                      anime={item}
                    />
                  ))}
                </section>
              )}
          </>
        )}
      </div>
    </main>
  );
}

export default Search;