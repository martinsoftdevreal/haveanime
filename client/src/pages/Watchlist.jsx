import { Bookmark } from 'lucide-react';

import EmptyState from '../components/common/EmptyState';

import './Watchlist.css';

function Watchlist() {
  return (
    <main className="watchlist-page">
      <div className="watchlist-container">
        <header className="watchlist-header">
          <div className="watchlist-header-icon">
            <Bookmark size={24} />
          </div>

          <div>
            <h1>My Watchlist</h1>
            <p>Anime you've saved for later</p>
          </div>
        </header>

        <EmptyState
          title="Your watchlist is empty"
          message="Save anime to your watchlist and they will appear here."
        />
      </div>
    </main>
  );
}



export default Watchlist;