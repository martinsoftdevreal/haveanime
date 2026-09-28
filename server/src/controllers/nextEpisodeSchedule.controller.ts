import { Context } from 'hono';
import { validationError } from '../utils/errors';
import {
  extractSchedule,
  ScheduledAnime,
} from '../extractor/extractSchedule';
import { axiosInstance } from '../services/axiosInstance';

const nextEpisodeScheduleController = async (
  c: Context
): Promise<ScheduledAnime[]> => {
  const id =
    c.req.param('id')?.trim();

  if (!id) {
    throw new validationError(
      'id is required'
    );
  }

  const date =
    c.req.query('date')?.trim();

  const targetDate =
    date ||
    new Date()
      .toISOString()
      .slice(0, 10);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      targetDate
    )
  ) {
    throw new validationError(
      'Invalid date format. Use YYYY-MM-DD'
    );
  }

  const endpoint =
    `/wp-json/hianime/v1/schedule/day?date=${targetDate}`;

  const result =
    await axiosInstance(endpoint);

  if (!result.success || !result.data) {
    throw new validationError(
      result.message ||
        'Failed to fetch schedule'
    );
  }

  let html =
    result.data;

  try {
    const parsed =
      JSON.parse(
        result.data
      );

    if (
      typeof parsed?.html ===
      'string'
    ) {
      html =
        parsed.html;
    } else if (
      typeof parsed?.data?.html ===
      'string'
    ) {
      html =
        parsed.data.html;
    }
  } catch {
    // Response is already HTML.
  }

  const schedule =
    extractSchedule(html);

  /*
   * The current upstream schedule endpoint
   * does not provide the old watch-page
   * "next episode" structure.
   *
   * We therefore match the anime ID only
   * when the extractor provides it.
   */

  const matched =
    schedule.filter(
      (anime) => {
        const item =
          anime as ScheduledAnime &
            Record<string, unknown>;

        const animeId =
          String(
            item.id ??
              item.animeId ??
              ''
          );

        return animeId === id;
      }
    );

  return matched;
};

export default nextEpisodeScheduleController;