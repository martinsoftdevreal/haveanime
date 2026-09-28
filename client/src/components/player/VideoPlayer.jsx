
import { useState } from 'react';
import './VideoPlayer.css';

function VideoPlayer({ src, title = 'Anime Player' }) {
  const [playbackError, setPlaybackError] = useState(null);

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

  const isDirectMediaSource =
    /\.(mp4|m3u8|webm|ogg|mkv|mov)(\?.*)?$/i.test(src) ||
    /action=play.*file=/i.test(src) ||
    /\/stream\//i.test(src);

  if (isDirectMediaSource) {
    const hasPlaybackError = playbackError === src;

    return (
      <div className="video-player">
        <video
          className="video-player__video"
          controls
          autoPlay
          playsInline
          preload="metadata"
          src={src}
          title={title}
          onError={() => setPlaybackError(src)}
        />
        {hasPlaybackError && (
          <div className="video-player__error" role="status">
            This stream is unavailable. Try another server or episode.
          </div>
        )}
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
