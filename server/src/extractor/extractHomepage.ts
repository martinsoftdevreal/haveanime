import { load } from 'cheerio';
import { Element } from 'domhandler';
import {
  HomePage,
  SpotlightAnime,
  TrendingAnime,
  AnimeFeatured,
} from '../types/anime';

const getLastPathSegment = (
  value?: string
): string | null => {
  if (!value) return null;

  try {
    const url = new URL(
      value,
      'https://aniwatch.co.at'
    );

    const parts =
      url.pathname
        .split('/')
        .filter(Boolean);

    return parts.at(-1) || null;
  } catch {
    const parts =
      value
        .split('/')
        .filter(Boolean);

    return parts.at(-1) || null;
  }
};

const getNumber = (
  value: string
): number | null => {
  const number = Number(value.trim());

  return Number.isFinite(number) &&
    number > 0
    ? number
    : null;
};

const createAnimeFeatured = (
  $:cheerio.CheerioAPI,
  element: Element
): AnimeFeatured => {
  const item = $(element);

  const titleElement =
    item
      .find(
        '.film-detail .film-name a, ' +
        '.film-detail .film-name .dynamic-name'
      )
      .first();

  const poster =
    item
      .find('.film-poster .film-poster-img')
      .first();

  const info =
    item.find('.fd-infor').first();

  return {
    title:
      titleElement.text().trim() ||
      null,

    alternativeTitle:
      titleElement.attr('data-jname') ||
      null,

    id:
      getLastPathSegment(
        titleElement.attr('href')
      ) ||
      getLastPathSegment(
        item
          .find('.film-poster-ahref')
          .attr('href')
      ),

    poster:
      poster.attr('data-src') ||
      poster.attr('src') ||
      null,

    type:
      info
        .find('.fdi-item')
        .first()
        .text()
        .trim() ||
      null,

    episodes: {
      sub:
        getNumber(
          item.find('.tick-sub').text()
        ),

      dub:
        getNumber(
          item.find('.tick-dub').text()
        ),

      eps:
        getNumber(
          item.find('.tick-eps').text()
        ) ||
        getNumber(
          item.find('.tick-sub').text()
        ),
    },
  };
};

export const extractHomepage = (
  html: string
): HomePage => {
  const $ = load(html);

  const response: HomePage = {
    spotlight: [],
    trending: [],
    topAiring: [],
    mostPopular: [],
    mostFavorite: [],
    latestCompleted: [],
    latestEpisode: [],
    newAdded: [],
    topUpcoming: [],

    top10: {
      today: null,
      week: null,
      month: null,
    },

    genres: [],
  };

  /*
   * ---------------------------------------------------------
   * SPOTLIGHT
   * ---------------------------------------------------------
   */

  $(
    '.deslide-wrap .swiper-wrapper .swiper-slide'
  ).each((index, element: Element) => {
    const item = $(element);

    const title =
      item
        .find('.desi-head-title')
        .first();

    const details =
      item
        .find('.sc-detail')
        .first();

    const poster =
      item
        .find(
          '.deslide-cover .film-poster-img'
        )
        .first();

    const obj: SpotlightAnime = {
      title:
        title.text().trim() ||
        null,

      alternativeTitle:
        title.attr('data-jname') ||
        null,

      id:
         getLastPathSegment(
      item
      .find('.film-poster-ahref')
      .first()
      .attr('href')
       ) ||
       getLastPathSegment(
      item
      .find('a[href*="/anime/"]')
      .first()
      .attr('href')
        ),

      poster:
        poster.attr('data-src') ||
        poster.attr('src') ||
        null,

      rank: index + 1,

      type:
        details
          .find('.scd-item')
          .first()
          .text()
          .trim() ||
        null,

      quality:
        details
          .find('.quality')
          .text()
          .trim() ||
        null,

      duration:
        details
          .find('.scd-item')
          .eq(1)
          .text()
          .trim() ||
        null,

      aired:
        details
          .find('.scd-item.m-hide')
          .text()
          .trim() ||
        null,

      synopsis:
        item
          .find('.desi-description')
          .text()
          .trim() ||
        null,

      episodes: {
        sub:
          getNumber(
            details.find('.tick-sub').text()
          ),

        dub:
          getNumber(
            details.find('.tick-dub').text()
          ),

        eps:
          getNumber(
            details.find('.tick-eps').text()
          ) ||
          getNumber(
            details.find('.tick-sub').text()
          ),
      },
    };

    response.spotlight.push(obj);
  });

  /*
   * ---------------------------------------------------------
   * TRENDING
   * ---------------------------------------------------------
   */

  $(
    '#trending-home .swiper-slide, ' +
    '.swiper-container .swiper-slide'
  ).each((index, element: Element) => {
    const item = $(element);

    const title =
      item
        .find(
          '.film-title, .film-name'
        )
        .first();

    const poster =
      item
        .find('.film-poster')
        .first();

    const anime: TrendingAnime = {
      title:
        title.text().trim() ||
        null,

      alternativeTitle:
        title.attr('data-jname') ||
        null,

      rank:
        index + 1,

      poster:
        poster
          .find('img')
          .attr('data-src') ||
        poster
          .find('img')
          .attr('src') ||
        null,

      id:
        getLastPathSegment(
          poster.attr('href')
        ) ||
        getLastPathSegment(
          item
            .find('a[href*="/anime/"]')
            .first()
            .attr('href')
        ),
    };

    if (
      anime.title ||
      anime.id ||
      anime.poster
    ) {
      response.trending.push(anime);
    }
  });

  /*
   * ---------------------------------------------------------
   * FEATURED BLOCKS
   * ---------------------------------------------------------
   */

  $(
    '#anime-featured .anif-block, ' +
    '.anif-blocks .anif-block'
  ).each((_, element: Element) => {
    const block = $(element);

    const heading =
      block
        .find('.anif-block-header')
        .text()
        .replace(/\s+/g, '')
        .trim();

    if (!heading) return;

    const data =
      block
        .find('.anif-block-ul ul li')
        .map((_, item: Element) =>
          createAnimeFeatured($, item)
        )
        .get();

    const normalized =
      heading.charAt(0).toLowerCase() +
      heading.slice(1);

    if (
      normalized in response &&
      Array.isArray(
        response[
          normalized as keyof HomePage
        ]
      )
    ) {
      (
        response[
          normalized as keyof HomePage
        ] as AnimeFeatured[]
      ).push(...data);
    }
  });

  /*
   * ---------------------------------------------------------
   * HOME FILM LISTS
   * ---------------------------------------------------------
   */

  $(
    '.block_area_home, ' +
    '.block_area.block_area_home'
  ).each((_, element: Element) => {
    const block = $(element);

    const heading =
      block
        .find('.cat-heading')
        .first()
        .text()
        .replace(/\s+/g, '')
        .trim();

    const data =
      block
        .find('.film_list-wrap .flw-item')
        .map((_, item: Element) =>
          createAnimeFeatured($, item)
        )
        .get();

    if (!data.length) return;

    const normalized =
      heading.charAt(0).toLowerCase() +
      heading.slice(1);

    if (
      normalized === 'newOnHiAnime'
    ) {
      response.newAdded = data;
      return;
    }

    const mapping: Record<
      string,
      keyof HomePage
    > = {
      topAiring: 'topAiring',
      mostPopular: 'mostPopular',
      mostFavorite: 'mostFavorite',
      latestCompleted: 'latestCompleted',
      latestEpisode: 'latestEpisode',
      newAdded: 'newAdded',
      topUpcoming: 'topUpcoming',
    };

    const key = mapping[normalized];

    if (key) {
      (
        response[key] as AnimeFeatured[]
      ).push(...data);
    }
  });

  /*
   * ---------------------------------------------------------
   * TOP 10
   * ---------------------------------------------------------
   */

  const extractTopTen = (
    selector: string
  ): TrendingAnime[] => {
    const result: TrendingAnime[] = [];

    $(
      `${selector} ul li`
    ).each(
      (index, element: Element) => {
        const item = $(element);

        const title =
          item
            .find('.film-name a')
            .first();

        const poster =
          item
            .find('.film-poster img')
            .first();

        result.push({
          title:
            title.text().trim() ||
            null,

          rank:
            index + 1,

          alternativeTitle:
            title.attr('data-jname') ||
            null,

          id:
            getLastPathSegment(
              title.attr('href')
            ),

          poster:
            poster.attr('data-src') ||
            poster.attr('src') ||
            null,
        });
      }
    );

    return result;
  };

  response.top10.today =
    extractTopTen('#top-viewed-day');

  response.top10.week =
    extractTopTen('#top-viewed-week');

  response.top10.month =
    extractTopTen('#top-viewed-month');

  /*
   * ---------------------------------------------------------
   * GENRES
   * ---------------------------------------------------------
   */

  $(
    '.sb-genre-list li'
  ).each((_, element: Element) => {
    const genre =
      $(element)
        .find('a')
        .attr('title')
        ?.trim()
        .toLowerCase();

    if (
      genre &&
      !response.genres.includes(genre)
    ) {
      response.genres.push(genre);
    }
  });

  return response;
};