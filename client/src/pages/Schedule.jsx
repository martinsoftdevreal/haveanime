import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';

import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

import './Schedule.css';

function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await api.getSchedules();

        const scheduleData =
          data?.data &&
          typeof data.data === 'object'
            ? data.data
            : {};

        const flattenedSchedule = Object.entries(
          scheduleData
        ).flatMap(([date, items]) => {
          if (!Array.isArray(items)) {
            return [];
          }

          return items.map((item) => ({
            ...item,
            date,
          }));
        });

        setSchedule(flattenedSchedule.slice(0, 12));
      } catch (err) {
        console.error('Schedule error:', err);
        setSchedule([]);
        setError(
          'Failed to load anime schedule.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <main className="schedule-page">
      <div className="schedule-container">
        <header className="schedule-header">
          <div className="schedule-header-icon">
            <CalendarDays size={24} />
          </div>

          <div>
            <h1>Anime Schedule</h1>
            <p>Upcoming anime episode releases</p>
          </div>
        </header>

        {loading && <Loader />}

        {!loading && error && (
          <ErrorMessage message={error} />
        )}

        {!loading &&
          !error &&
          schedule.length === 0 && (
            <EmptyState
              title="No schedule found"
              message="No upcoming anime episodes are available."
            />
          )}

        {!loading &&
          !error &&
          schedule.length > 0 && (
            <section className="schedule-list">
              {schedule.map((item, index) => {
                const title =
                  item?.title ||
                  item?.name ||
                  'Unknown Anime';

                const time =
                  item?.time || '';

                const episode =
                  item?.episode ??
                  '';

                const id =
                  item?.id || '';

                const date =
                  item?.date || '';

                return (
                  <article
                    className="schedule-item"
                    key={
                      `${id}-${date}-${episode}-${index}`
                    }
                  >
                    <div className="schedule-item__icon">
                      <CalendarDays size={20} />
                    </div>

                    <div className="schedule-item__content">
                      {id ? (
                        <a
                          href={`/anime/${id}`}
                          className="schedule-item__title"
                        >
                          {title}
                        </a>
                      ) : (
                        <h2 className="schedule-item__title">
                          {title}
                        </h2>
                      )}

                      <div>
                        {date && (
                          <span className="schedule-item__episode">
                            {date}
                          </span>
                        )}

                        {episode !== '' && (
                          <span className="schedule-item__episode">
                            {' '}
                            • Episode {episode}
                          </span>
                        )}
                      </div>
                    </div>

                    {time && (
                      <time className="schedule-item__time">
                        {time}
                      </time>
                    )}
                  </article>
                );
              })}
            </section>
          )}
      </div>
    </main>
  );
}

export default Schedule;