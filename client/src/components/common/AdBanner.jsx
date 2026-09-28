import './AdBanner.css';

const ADSTERRA_SMART_LINK =
  'https://www.profitableratecpmnetwork.com/i2vaxuzpbe?key=b7ece4d1091774590292d55f40287ad8';

function AdBanner({ label = 'Advertisement' }) {
  return (
    <aside className="ad-banner" aria-label="Advertisement">
      <div className="ad-banner__content">
        <span className="ad-banner__label">{label}</span>
        <a
          className="ad-banner__link"
          href={ADSTERRA_SMART_LINK}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
        >
          Visit sponsor
        </a>
      </div>
    </aside>
  );
}

export default AdBanner;