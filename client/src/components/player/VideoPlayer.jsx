
import './VideoPlayer.css';

function VideoPlayer({ src, title = 'Anime Player' }) {
  if (!src) {
    return (
      <div className="video-player video-player--empty">
        <div className="video-player__message">
          <span className="video-player__icon">▶</span>
          <p>Video source is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player">
      <iframe
        className="video-player__iframe"
        src={src}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        referrerPolicy="origin"
      />
    </div>
  );
}

export default VideoPlayer;

