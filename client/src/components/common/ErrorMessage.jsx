import './ErrorMessage.css';

function ErrorMessage({
  message = 'Something went wrong.',
  onRetry,
}) {
  return (
    <div className="error-message" role="alert">
      <p className="error-message__text">{message}</p>

      {onRetry && (
        <button
          type="button"
          className="error-message__retry"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;