import './ServerSelector.css';

function ServerSelector({
  servers = [],
  selectedServer,
  onSelect,
}) {
  if (!servers.length) {
    return null;
  }

  return (
    <section className="server-selector">
      <div className="server-selector__header">
        <h3 className="server-selector__title">Servers</h3>

        <span className="server-selector__count">
          {servers.length}
        </span>
      </div>

      <div className="server-selector__list">
        {servers.map((server, index) => {
          const serverId =
            server.id ??
            server.serverId ??
            server.name ??
            index;

          const serverName =
            server.name ??
            server.title ??
            `Server ${index + 1}`;

          const isSelected =
            selectedServer?.id === serverId ||
            selectedServer?.serverId === serverId ||
            selectedServer?.name === serverId;

          return (
            <button
              key={`${serverName}-${serverId}-${index}`}
              type="button"
              className={`server-selector__button ${
                isSelected
                  ? 'server-selector__button--active'
                  : ''
              }`}
              onClick={() => onSelect?.(server)}
            >
              <span className="server-selector__status">
                {isSelected ? '●' : '○'}
              </span>

              <span className="server-selector__name">
                {serverName}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ServerSelector;