import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  LogOut,
  Heart,
  Bookmark,
  Clock,
} from 'lucide-react';

import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedIn =
      localStorage.getItem('hianimeLoggedIn') ===
      'true';

    const storedUser = JSON.parse(
      localStorage.getItem('hianimeUser')
    );

    if (!loggedIn || !storedUser) {
      window.location.href = '/register';
      return;
    }

    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(
      'hianimeLoggedIn'
    );

    window.location.href = '/';
  };

  if (!user) {
    return null;
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <section className="profile-card">
          <div className="profile-header">
            <img
              src={user.avatar}
              alt={`${user.name} profile`}
              className="profile-avatar"
            />

            <div className="profile-user-info">
              <h1>{user.name}</h1>

              <p>
                <Mail size={16} />
                {user.email}
              </p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <Bookmark size={22} />

              <strong>0</strong>

              <span>Watchlist</span>
            </div>

            <div className="profile-stat">
              <Heart size={22} />

              <strong>0</strong>

              <span>Favorites</span>
            </div>

            <div className="profile-stat">
              <Clock size={22} />

              <strong>0</strong>

              <span>History</span>
            </div>
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className="profile-logout"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Profile;