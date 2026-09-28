import { load } from 'cheerio';

export interface ScheduledAnime {
  title: string | null;
  alternativeTitle: string | null;
  id: string | null;
  time: string | null;
  episode: number | null;
}

/**
 * Extract the last useful path segment from a URL.
 */
const getLastPathSegment = (
  value?: string
): string | null => {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(
      value,
      'https://aniwatch.co.at'
    );

    const segments =
      url.pathname
        .split('/')
        .filter(Boolean);

    return (
      segments.at(-1) ||
      null
    );
  } catch {
    const segments =
      value
        .split('/')
        .filter(Boolean);

    return (
      segments.at(-1) ||
      null
    );
  }
};

/**
 * Try to extract an anime ID from an element.
 */
const getAnimeId = (
  $: ReturnType<typeof load>,
  element: Parameters<
    ReturnType<typeof load>
  >[0]
): string | null => {
  const item = $(element);

  /*
   * First check common data attributes.
   */
  const dataId =
    item.attr('data-animeid') ||
    item.attr('data-id') ||
    item.attr('data-id-anime');

  if (dataId) {
    return dataId.trim();
  }

  /*
   * Check links inside the schedule item.
   */
  const links = item.find('a[href]');

  let animeHref: string | undefined;

  links.each((_, link) => {
    if (animeHref) {
      return;
    }

    const href =
      $(link).attr('href');

    if (!href) {
      return;
    }

    /*
     * Accept different possible anime URL formats.
     */
    if (
      href.includes('/anime/') ||
      href.includes('/watch/')
    ) {
      animeHref = href;
    }
  });

  if (animeHref) {
    const id =
      getLastPathSegment(animeHref);

    if (id) {
      return id;
    }
  }

  /*
   * Finally check the element's own href.
   */
  const href =
    item.attr('href');

  if (href) {
    return getLastPathSegment(href);
  }

  return null;
};

/**
 * Extract title from a schedule item.
 */
const getTitle = (
  $: ReturnType<typeof load>,
  element: Parameters<
    ReturnType<typeof load>
  >[0]
): string | null => {
  const item = $(element);

  const selectors = [
    '.film-name',
    '.film-name a',
    '.film-name a[href]',
    '.film-title',
    '.anime-name',
    '.name',
    '[data-jname]',
  ];

  for (const selector of selectors) {
    const titleElement =
      item.find(selector).first();

    const text =
      titleElement
        .text()
        .replace(/\s+/g, ' ')
        .trim();

    if (text) {
      return text;
    }
  }

  /*
   * If the schedule item itself is an anchor,
   * use its text as a fallback.
   */
  if (
    item.is('a')
  ) {
    const text =
      item
        .text()
        .replace(/\s+/g, ' ')
        .trim();

    if (text) {
      return text;
    }
  }

  return null;
};

/**
 * Extract Japanese / alternative title.
 */
const getAlternativeTitle = (
  $: ReturnType<typeof load>,
  element: Parameters<
    ReturnType<typeof load>
  >[0]
): string | null => {
  const item = $(element);

  const selectors = [
    '[data-jname]',
    '.film-name a[data-jname]',
    '.film-name[data-jname]',
  ];

  for (const selector of selectors) {
    const titleElement =
      item.find(selector).first();

    const value =
      titleElement
        .attr('data-jname')
        ?.trim();

    if (value) {
      return value;
    }
  }

  const ownJname =
    item
      .attr('data-jname')
      ?.trim();

  return ownJname || null;
};

/**
 * Extract release time.
 */
const getTime = (
  $: ReturnType<typeof load>,
  element: Parameters<
    ReturnType<typeof load>
  >[0]
): string | null => {
  const item = $(element);

  const selectors = [
    '.time',
    '.schedule-time',
    '.fdi-duration',
    '.release-time',
    '[class*="time"]',
  ];

  for (const selector of selectors) {
    const timeElement =
      item.find(selector).first();

    const text =
      timeElement
        .text()
        .replace(/\s+/g, ' ')
        .trim();

    if (text) {
      return text;
    }
  }

  /*
   * Some schedule markup may put the time
   * directly in a data attribute.
   */
  const timeAttribute =
    item.attr('data-time') ||
    item.attr('data-release-time');

  if (timeAttribute) {
    return timeAttribute.trim();
  }

  return null;
};

/**
 * Extract episode number.
 */
const getEpisode = (
  $: ReturnType<typeof load>,
  element: Parameters<
    ReturnType<typeof load>
  >[0]
): number | null => {
  const item = $(element);

  const text =
    item
      .text()
      .replace(/\s+/g, ' ')
      .trim();

  /*
   * Examples:
   * Episode 12
   * Ep 12
   * EP12
   * E12
   */
  const episodePatterns = [
    /Episode\s*[:#-]?\s*(\d+)/i,
    /\bEp\.?\s*[:#-]?\s*(\d+)/i,
    /\bE\s*[:#-]?\s*(\d+)\b/i,
  ];

  for (const pattern of episodePatterns) {
    const match =
      text.match(pattern);

    if (match) {
      return Number(match[1]);
    }
  }

  /*
   * Check common data attributes.
   */
  const episodeAttribute =
    item.attr('data-episode') ||
    item.attr('data-ep') ||
    item.attr('data-number');

  if (episodeAttribute) {
    const number =
      Number(episodeAttribute);

    if (
      Number.isFinite(number)
    ) {
      return number;
    }
  }

  return null;
};

/**
 * Check whether an element looks like
 * an actual schedule item.
 */
const isScheduleItem = (
  $: ReturnType<typeof load>,
  element: Parameters<
    ReturnType<typeof load>
  >[0]
): boolean => {
  const item = $(element);

  /*
   * Schedule containers commonly have one
   * of these classes.
   */
  const className =
    item.attr('class') || '';

  if (
    /flw-item|film_list-wrap|schedule|film-poster/i.test(
      className
    )
  ) {
    return true;
  }

  /*
   * An element containing a title and an
   * anime/watch link is also a candidate.
   */
  const hasTitle =
    item.find(
      '.film-name, .film-title, .anime-name, .name'
    ).length > 0;

  const hasAnimeLink =
    item
      .find('a[href]')
      .toArray()
      .some((link) => {
        const href =
          $(link).attr('href');

        return (
          !!href &&
          (
            href.includes('/anime/') ||
            href.includes('/watch/')
          )
        );
      });

  return (
    hasTitle &&
    hasAnimeLink
  );
};

export const extractSchedule = (
  html: string
): ScheduledAnime[] => {
  if (
    !html ||
    typeof html !== 'string'
  ) {
    return [];
  }

  const $ = load(html);

  const response: ScheduledAnime[] = [];

  /*
   * These are the most likely schedule
   * container structures.
   */
  const containers = [
    '.flw-item',
    '.film_list-wrap .flw-item',
    '.film_list-grid .flw-item',
    '.schedule-item',
    '.schedule-list .flw-item',
  ];

  let foundContainer = false;

  for (const selector of containers) {
    const elements =
      $(selector);

    if (
      elements.length === 0
    ) {
      continue;
    }

    foundContainer = true;

    elements.each((_, element) => {
      const title =
        getTitle($, element);

      if (!title) {
        return;
      }

      const id =
        getAnimeId($, element);

      const alternativeTitle =
        getAlternativeTitle(
          $,
          element
        );

      const time =
        getTime($, element);

      const episode =
        getEpisode($, element);

      response.push({
        title,
        alternativeTitle,
        id,
        time,
        episode,
      });
    });

    /*
     * Once we find actual schedule
     * containers, don't process the same
     * HTML through every selector.
     */
    if (
      response.length > 0
    ) {
      break;
    }
  }

  /*
   * Fallback:
   *
   * If the expected schedule containers
   * changed, inspect elements containing
   * anime/watch links.
   */
  if (
    response.length === 0
  ) {
    $('a[href]').each(
      (_, anchor) => {
        const href =
          $(anchor).attr('href');

        if (!href) {
          return;
        }

        const isAnimeLink =
          href.includes('/anime/') ||
          href.includes('/watch/');

        if (!isAnimeLink) {
          return;
        }

        /*
         * Find the closest likely schedule
         * container.
         */
        const parent =
          $(anchor).closest(
            '.flw-item, .schedule-item, .film_list-wrap, li, article, div'
          ).first();

        const element =
          parent.length > 0
            ? parent
            : $(anchor);

        if (
          !isScheduleItem(
            $,
            element
          ) &&
          element[0] !== anchor
        ) {
          return;
        }

        const title =
          getTitle(
            $,
            element
          );

        if (!title) {
          return;
        }

        const id =
          getAnimeId(
            $,
            element
          );

        const alternativeTitle =
          getAlternativeTitle(
            $,
            element
          );

        const time =
          getTime(
            $,
            element
          );

        const episode =
          getEpisode(
            $,
            element
          );

        response.push({
          title,
          alternativeTitle,
          id,
          time,
          episode,
        });
      }
    );
  }

  /*
   * Remove duplicates.
   */
  const unique =
    new Map<
      string,
      ScheduledAnime
    >();

  for (const item of response) {
    const key =
      [
        item.id || '',
        item.title || '',
        item.episode ?? '',
        item.time || '',
      ].join('|');

    if (
      !unique.has(key)
    ) {
      unique.set(
        key,
        item
      );
    }
  }

  return Array.from(
    unique.values()
  );
};