import './EmptyState.css';


function EmptyState({
  title = 'No results found',
  message = 'There is nothing to display right now.',
}) {
  return (
    <div className="empty-state">
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__text">{message}</p>
    </div>
  );
}

export default EmptyState;