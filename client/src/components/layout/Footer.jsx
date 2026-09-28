import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="/" className="footer__logo">
              HiAnime
            </a>

            <p className="footer__description">
              Discover, search, and explore your favorite anime
              in one modern streaming experience.
            </p>
          </div>

          <div className="footer__column">
            <h3 className="footer__heading">Navigation</h3>

            <a href="/" className="footer__link">
              Home
            </a>

            <a href="/anime" className="footer__link">
              Anime
            </a>

            <a href="/search" className="footer__link">
              Search
            </a>

            <a href="/schedule" className="footer__link">
              Schedule
            </a>
          </div>

          <div className="footer__column">
            <h3 className="footer__heading">Explore</h3>

            <a href="/genres" className="footer__link">
              Genres
            </a>

            <a href="/anime" className="footer__link">
              Popular Anime
            </a>

            <a href="/anime" className="footer__link">
              Latest Anime
            </a>
          </div>

          <div className="footer__column">
            <h3 className="footer__heading">Support</h3>

            <a href="/" className="footer__link">
              About
            </a>

            <a href="/" className="footer__link">
              Contact
            </a>

            <a href="/" className="footer__link">
              Privacy
            </a>

            <a href="/" className="footer__link">
              Terms
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} HiAnime. All rights reserved.
          </p>

          <p className="footer__made">
            Built with React &amp; Vite
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;