
import { load } from 'cheerio';
import { Element } from 'domhandler';

import {
  AnimeFeatured,
  TrendingAnime,
} from '../types/anime';

export interface ListPageResponse {
  pageInfo: {
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
  };

  response: ListPageAnime[];

  top10: {
    today: TrendingAnime[] | null;
    week: TrendingAnime[] | null;
    month: TrendingAnime[] | null;
  };

  genres: string[];
}

export interface ListPageAnime extends AnimeFeatured {
  duration: string | null;
}

/**
 * Extract numeric anime ID from the current AniWatch card.
 *
 * Current HTML:
 * <a
 *   class="film-poster-ahref item-qtip"
 *   data-id="852"
 *   href="https://aniwatch.co.at/anime/frieren..."
 * >
 */
const getAnimeId = (
  item: ReturnType<ReturnType<typeof load>>
): string | null => {
  const posterLink = item
    .find('.film-poster-ahref[data-id]')
    .first();

  const dataId =
    posterLink.attr('data-id')?.trim();

  if (
    dataId &&
    /^\d+$/.test(dataId)
  ) {
    return dataId;
  }

  return null;
};

const getNumber = (
  value: string
): number | null => {
  const number = Number(
    value.trim()
  );

  return Number.isFinite(number) &&
    number > 0
    ? number
    : null;
};

export const extractListPage = (
  html: string
): ListPageResponse => {
  const $ = load(html);

  const response: ListPageAnime[] = [];

  /*
   * ============================================================
   * ANIME LIST
   * ============================================================
   */

  $('.film_list-wrap .flw-item').each(
    (_, element: Element) => {
      const item = $(element);

      const title =
        item
          .find(
            '.film-detail .film-name a.dynamic-name, ' +
            '.film-detail .film-name a'
          )
          .first();

      const poster =
        item
          .find(
            '.film-poster .film-poster-img'
          )
          .first();

      const info =
        item
          .find('.fd-infor')
          .first();

      const anime: ListPageAnime = {
        title:
          title
            .text()
            .trim() ||
          null,

        alternativeTitle:
          title
            .attr('data-jname')
            ?.trim() ||
          null,

        /*
         * IMPORTANT:
         * Use the canonical numeric anime ID
         * from data-id instead of the episode slug.
         */
        id:
          getAnimeId(item),

        poster:
          poster
            .attr('data-src') ||
          poster
            .attr('src') ||
          null,

        episodes: {
          sub:
            getNumber(
              item
                .find('.tick-sub')
                .text()
            ),

          dub:
            getNumber(
              item
                .find('.tick-dub')
                .text()
            ),

          eps:
            getNumber(
              item
                .find('.tick-eps')
                .text()
            ) ||
            getNumber(
              item
                .find('.tick-sub')
                .text()
            ),
        },

        type:
          info
            .find('.fdi-item')
            .first()
            .text()
            .trim() ||
          null,

        duration:
          info
            .find('.fdi-duration')
            .text()
            .trim() ||
          null,
      };

      response.push(anime);
    }
  );

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */

  const pagination =
    $('.pre-pagination .pagination');

  let currentPage = 1;
  let totalPages = 1;
  let hasNextPage = false;

  if (pagination.length) {
    const activePage =
      pagination
        .find(
          '.page-item.active .page-link'
        )
        .first()
        .text()
        .trim();

    if (activePage) {
      currentPage =
        Number(activePage) || 1;
    }

    const pageLinks =
      pagination.find(
        '.page-item .page-link'
      );

    const pageNumbers =
      pageLinks
        .map(
          (_, element: Element) => {
            const text =
              $(element)
                .text()
                .trim();

            const number =
              Number(text);

            return Number.isFinite(
              number
            )
              ? number
              : null;
          }
        )
        .get()
        .filter(
          (
            value
          ): value is number =>
            value !== null
        );

    if (pageNumbers.length) {
      totalPages =
        Math.max(...pageNumbers);
    }

    hasNextPage =
      pagination
        .find(
          '.page-item.next:not(.disabled), ' +
          '.page-item:last-child:not(.disabled)'
        )
        .length > 0;
  }

  /*
   * ============================================================
   * TOP 10
   * ============================================================
   */

  const extractTopTen = (
    selector: string
  ): TrendingAnime[] => {
    const result: TrendingAnime[] = [];

    $(`${selector} ul li`).each(
      (
        index,
        element: Element
      ) => {
        const item = $(element);

        const title =
          item
            .find(
              '.film-name a'
            )
            .first();

        const poster =
          item
            .find(
              '.film-poster img'
            )
            .first();

        /*
         * Top-10 cards may also expose
         * the canonical numeric ID.
         */
        const posterLink =
          item
            .find(
              '.film-poster-ahref[data-id]'
            )
            .first();

        const dataId =
          posterLink
            .attr('data-id')
            ?.trim();

        const id =
          dataId &&
          /^\d+$/.test(dataId)
            ? dataId
            : null;

        result.push({
          title:
            title
              .text()
              .trim() ||
            null,

          rank:
            index + 1,

          alternativeTitle:
            title
              .attr('data-jname')
              ?.trim() ||
            null,

          id,

          poster:
            poster
              .attr('data-src') ||
            poster
              .attr('src') ||
            null,
        });
      }
    );

    return result;
  };

  /*
   * ============================================================
   * GENRES
   * ============================================================
   */

  const genres: string[] = [];

  $('.sb-genre-list li').each(
    (
      _,
      element: Element
    ) => {
      const genre =
        $(element)
          .find('a')
          .attr('title')
          ?.trim()
          .toLowerCase();

      if (
        genre &&
        !genres.includes(genre)
      ) {
        genres.push(genre);
      }
    }
  );

  /*
   * ============================================================
   * RESPONSE
   * ============================================================
   */

  return {
    pageInfo: {
      currentPage,
      hasNextPage,
      totalPages,
    },

    response,

    top10: {
      today:
        extractTopTen(
          '#top-viewed-day'
        ),

      week:
        extractTopTen(
          '#top-viewed-week'
        ),

      month:
        extractTopTen(
          '#top-viewed-month'
        ),
    },

    genres,
  };
};

