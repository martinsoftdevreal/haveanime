import { Search, UserCircle } from 'lucide-react';

import './Navbar.css';

function Navbar() {
  const isLoggedIn =
    localStorage.getItem('hianimeLoggedIn') ===
    'true';

  const profilePath = isLoggedIn
    ? '/profile'
    : '/register';

  return (
    <header className="navbar">
      <div className="navbar__container container">
        <a
          href="/"
          className="navbar__logo"
        >
          HiAnime
        </a>

        <nav
          className="navbar__links"
          aria-label="Main navigation"
        >
          <a href="/">Home</a>
          <a href="/anime">Anime</a>
          <a href="/genres">Genres</a>
          <a href="/schedule">Schedule</a>
        </nav>

        <div className="navbar__actions">
          <a
            href="/search"
            className="navbar__search-icon"
            aria-label="Search anime"
            title="Search anime"
          >
            <Search
              size={21}
              strokeWidth={2}
              aria-hidden="true"
            />
          </a>

          <a
            href={profilePath}
            className="navbar__profile"
            aria-label={
              isLoggedIn
                ? 'Open profile'
                : 'Create account'
            }
            title={
              isLoggedIn
                ? 'Profile'
                : 'Create account'
            }
          >
            <UserCircle
              size={22}
              strokeWidth={2}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;