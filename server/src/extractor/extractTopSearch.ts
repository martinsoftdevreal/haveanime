
import * as cheerio from 'cheerio';

export interface TopSearchAnime {
  title: string | null;
  link: string | null;
  id: string | null;
}

const getLastPathSegment = (
  value?: string
): string | null => {
  if (!value) return null;

  try {
    const url = new URL(
      value,
      'https://aniwatch.co.at'
    );

    return (
      url.pathname
        .split('/')
        .filter(Boolean)
        .at(-1) ||
      null
    );
  } catch {
    return (
      value
        .split('/')
        .filter(Boolean)
        .at(-1) ||
      null
    );
  }
};

const cleanTitle = (
  value?: string
): string | null => {
  if (!value) return null;

  const title = value
    .replace(/\s+/g, ' ')
    .trim();

  if (!title) return null;

  /*
   * The current homepage sometimes exposes
   * "Detail" as the visible text of an anime
   * link. That is not the anime title.
   */
  if (title.toLowerCase() === 'detail') {
    return null;
  }

  return title;
};

export const extractTopSearch = (
  html: string
): TopSearchAnime[] => {
  const $ = cheerio.load(html);

  const topSearch: TopSearchAnime[] = [];

  /*
   * ============================================================
   * ORIGINAL TOP SEARCH WIDGET
   * ============================================================
   */

  $('.xhashtag .item').each(
    (_, element) => {
      const item = $(element);

      const link =
        item.attr('href') ||
        null;

      if (
        !link ||
        !link.includes('/anime/')
      ) {
        return;
      }

      const title =
        cleanTitle(
          item.attr('title') ||
          item.text()
        );

      /*
       * Do not add an item when the current
       * markup only gives us "Detail".
       */
      if (!title) {
        return;
      }

      if (
        topSearch.some(
          anime =>
            anime.link === link
        )
      ) {
        return;
      }

      topSearch.push({
        title,
        link,
        id:
          getLastPathSegment(link),
      });
    }
  );

  /*
   * ============================================================
   * CURRENT HOMEPAGE FALLBACK
   * ============================================================
   *
   * The current AniWatch homepage contains many
   * /anime/ links. We prefer the actual anime
   * title from:
   *
   * 1. .film-name
   * 2. data-jname
   * 3. title attribute
   * 4. anchor text
   *
   * This prevents "Detail" from becoming the
   * returned anime title.
   */

  if (!topSearch.length) {
    $('a[href*="/anime/"]').each(
      (_, element) => {
        const item = $(element);

        const link =
          item.attr('href');

        if (
          !link ||
          !link.includes('/anime/')
        ) {
          return;
        }

        /*
         * Find the nearest anime card.
         */
        const card =
          item.closest(
            '.flw-item, .film-detail, .film-poster, .item'
          );

        const cardTitle =
          card
            .find(
              '.film-name a.dynamic-name, ' +
              '.film-name a, ' +
              '.dynamic-name'
            )
            .first();

        let title =
          cleanTitle(
            cardTitle
              .attr('title')
          );

        if (!title) {
          title =
            cleanTitle(
              cardTitle
                .attr('data-jname')
            );
        }

        if (!title) {
          title =
            cleanTitle(
              cardTitle.text()
            );
        }

        if (!title) {
          title =
            cleanTitle(
              item.attr('title')
            );
        }

        if (!title) {
          title =
            cleanTitle(
              item.text()
            );
        }

        /*
         * Ignore navigation/action links where
         * the only text is "Detail".
         */
        if (!title) {
          return;
        }

        if (
          topSearch.some(
            anime =>
              anime.link === link
          )
        ) {
          return;
        }

        topSearch.push({
          title,
          link,
          id:
            getLastPathSegment(link),
        });
      }
    );
  }

  return topSearch;
};

