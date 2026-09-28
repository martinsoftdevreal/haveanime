import './AdBanner.css';

function AdBanner({ label = 'Advertisement' }) {
  return (
    <aside className="ad-banner" aria-label="Advertisement">
      <div className="ad-banner__content">
        {label}
      </div>
    </aside>
  );
}

export default AdBanner;