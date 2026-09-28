import {
  House,
  Compass,
  Tags,
  CalendarDays,
  Flame,
  Star,
  RefreshCw,
  Shuffle,
} from 'lucide-react';

import './Sidebar.css';

const sidebarLinks = [
  {
    label: 'Home',
    href: '/',
    icon: House,
  },
  {
    label: 'Anime',
    href: '/anime',
    icon: Compass,
  },
  {
    label: 'Genres',
    href: '/genres',
    icon: Tags,
  },
  {
    label: 'Schedule',
    href: '/schedule',
    icon: CalendarDays,
  },
  {
    label: 'Top Airing',
    href: '/top-airing',
    icon: Flame,
  },
  {
    label: 'Most Popular',
    href: '/most-popular',
    icon: Star,
  },
  {
    label: 'Recently Updated',
    href: '/recently-updated',
    icon: RefreshCw,
  },
  {
    label: 'Random Anime',
    href: '/random',
    icon: Shuffle,
  },
];

function Sidebar() {
  const currentPath = window.location.pathname;

  return (
    <aside className="sidebar">
      <nav
        className="sidebar__nav"
        aria-label="Sidebar navigation"
      >
        {sidebarLinks.map((link) => {
          const Icon = link.icon;

          const isActive =
            link.href === '/'
              ? currentPath === '/'
              : currentPath === link.href ||
                currentPath.startsWith(
                  `${link.href}/`
                );

          return (
            <a
              key={link.label}
              href={link.href}
              className={`sidebar__link ${
                isActive
                  ? 'sidebar__link--active'
                  : ''
              }`}
              aria-current={
                isActive ? 'page' : undefined
              }
            >
              <Icon
                className="sidebar__icon"
                size={19}
                strokeWidth={2}
                aria-hidden="true"
              />

              <span>{link.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;