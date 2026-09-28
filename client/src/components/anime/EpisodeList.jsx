
import './EpisodeList.css';

function EpisodeList({
  episodes = [],
  currentEpisodeId,
  animeId,
}) {
  if (!episodes.length) {
    return (
      <div className="episode-list episode-list--empty">
        <p>No episodes available.</p>
      </div>
    );
  }

  return (
    <div className="episode-list">
      {episodes.map((episode, index) => {
        const episodeId =
          episode?.id ??
          episode?.episodeId ??
          episode?.episode_id;

        const episodeNumber =
          episode?.episodeNumber ??
          episode?.number ??
          episode?.episode ??
          index + 1;

        const episodeName =
          episode?.title ??
          episode?.name ??
          episode?.episodeTitle ??
          `Episode ${episodeNumber}`;

        const isCurrent =
          String(episodeId) === String(currentEpisodeId);

        return (
          <a
            key={episodeId ?? `episode-${index}`}
            href={`/watch/${animeId}/${episodeId}`}
            className={`episode-list__item ${
              isCurrent
                ? 'episode-list__item--active'
                : ''
            }`}
          >
            <span className="episode-list__number">
              {episodeNumber}
            </span>

            <span className="episode-list__info">
              <span className="episode-list__name">
                {episodeName}
              </span>

              <span className="episode-list__label">
                Episode {episodeNumber}
              </span>
            </span>

            {isCurrent && (
              <span className="episode-list__playing">
                ▶
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}

export default EpisodeList;
