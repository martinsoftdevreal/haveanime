import {
  House,
  Compass,
  Search,
  Heart,
} from 'lucide-react';

import './MobileNavbar.css';

const mobileLinks = [
  {
    label: 'Home',
    icon: House,
    href: '/',
  },
  {
    label: 'Anime',
    icon: Compass,
    href: '/anime',
  },
  {
    label: 'Home',
    icon: House,
    href: '/',
    home: true,
  },
  {
    label: 'Search',
    icon: Search,
    href: '/search',
  },
  {
    label: 'Watchlist',
    icon: Heart,
    href: '/watchlist',
  },
];

function MobileNavbar() {
  const currentPath = window.location.pathname;

  return (
    <nav
      className="mobile-navbar"
      aria-label="Mobile navigation"
    >
      <div className="mobile-navbar__nav">
        {mobileLinks.map((link, index) => {
          const Icon = link.icon;

          const isActive =
            link.href === '/'
              ? currentPath === '/'
              : currentPath === link.href ||
                currentPath.startsWith(`${link.href}/`);

          return (
            <a
              key={`${link.label}-${link.href}-${index}`}
              href={link.href}
              className={`mobile-navbar__link ${
                isActive
                  ? 'mobile-navbar__link--active'
                  : ''
              }`}
              aria-current={
                isActive ? 'page' : undefined
              }
            >
              {link.home ? (
                <span className="mobile-navbar__home">
                  <Icon
                    className="mobile-navbar__icon"
                    size={23}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
              ) : (
                <>
                  <Icon
                    className="mobile-navbar__icon"
                    size={20}
                    strokeWidth={2}
                    aria-hidden="true"
                  />

                  <span>{link.label}</span>
                </>
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNavbar;