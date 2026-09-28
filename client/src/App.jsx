import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MobileNavbar from './components/layout/MobileNavbar';
import Footer from './components/layout/Footer';
import BackendStatus from './components/common/BackendStatus';

import Home from './pages/Home';
import AnimeDetails from './pages/AnimeDetails';
import Watch from './pages/Watch';
import Search from './pages/Search';

import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';

import TopAiring from './pages/TopAiring';
import MostPopular from './pages/MostPopular';
import RecentlyUpdated from './pages/RecentlyUpdated';
import Genres from './pages/Genres';
import Schedule from './pages/Schedule';
import RandomAnime from './pages/RandomAnime';
import Watchlist from './pages/Watchlist';

function App() {
  const path = window.location.pathname;

  const watchMatch = path.match(
    /^\/watch\/([^/]+)\/([^/]+)$/
  );

  const genreMatch = path.match(
    /^\/anime\/genre\/(.+)$/
  );

  const animeDetailsMatch = path.match(
    /^\/anime\/(.+)$/
  );

  const isSearch = path === '/search';
  const isRegister = path === '/register';
  const isLogin = path === '/login';
  const isProfile = path === '/profile';

  const isHome =
    path === '/' ||
    path === '/anime';

  const listPages = {
    '/top-airing': 'top-airing',
    '/most-popular': 'most-popular',
    '/recently-updated': 'recently-updated',
  };

  const listQuery = listPages[path];

  const isGenres = path === '/genres';
  const isSchedule = path === '/schedule';
  const isRandom = path === '/random';
  const isWatchlist = path === '/watchlist';

  return (
    <>
      <Navbar />
      <Sidebar />
      <MobileNavbar />
      <BackendStatus />

      {watchMatch ? (
        <Watch
          animeId={decodeURIComponent(watchMatch[1])}
          episodeId={decodeURIComponent(watchMatch[2])}
        />
      ) : genreMatch ? (
        <Genres
          genre={decodeURIComponent(genreMatch[1])}
        />
      ) : animeDetailsMatch ? (
        <AnimeDetails
          animeId={decodeURIComponent(animeDetailsMatch[1])}
        />
      ) : isSearch ? (
        <Search />
      ) : isRegister ? (
        <Register />
      ) : isLogin ? (
        <Login />
      ) : isProfile ? (
        <Profile />
      ) : isHome ? (
        <Home />
      ) : listQuery === 'top-airing' ? (
        <TopAiring />
      ) : listQuery === 'most-popular' ? (
        <MostPopular />
      ) : listQuery === 'recently-updated' ? (
        <RecentlyUpdated />
      ) : listQuery ? (
        <Home />
      ) : isGenres ? (
        <Genres />
      ) : isSchedule ? (
        <Schedule />
      ) : isRandom ? (
        <RandomAnime />
      ) : isWatchlist ? (
        <Watchlist />
      ) : (
        <Home />
      )}

      <Footer />
    </>
  );
}

export default App;