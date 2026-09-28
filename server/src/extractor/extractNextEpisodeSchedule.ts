import { load } from 'cheerio';

export const extractNextEpisodeSchedule = (
  html: string
): string | null => {
  const $ =
    load(html);

  /*
   * Original schedule-date attribute.
   */

  const scheduleDate =
    $('#schedule-date')
      .attr('data-value');

  if (scheduleDate) {
    return scheduleDate.trim();
  }

  /*
   * Current page fallback.
   */

  const scheduleSelectors = [
    '.tick-item.tick-eps.schedule',
    '.schedule-date',
    '[data-schedule]',
    '[data-date]',
  ];

  for (
    const selector of scheduleSelectors
  ) {
    const element =
      $(selector).first();

    if (!element.length) {
      continue;
    }

    const value =
      element.attr('data-value') ||
      element.attr('data-schedule') ||
      element.attr('data-date') ||
      element.text().trim();

    if (value) {
      return value;
    }
  }

  return null;
};