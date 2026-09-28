import { load } from 'cheerio';
import { Element } from 'domhandler';
import { DetailAnime, AnimeFeatured, Season } from '../types/anime';

const getLastPathSegment = (value?: string): string | null => {
  if (!value) return null;

  try {
    const url = new URL(value, 'https://aniwatch.co.at');
    const parts = url.pathname.split('/').filter(Boolean);

    return parts.at(-1) || null;
  } catch {
    const parts = value.split('/').filter(Boolean);
    return parts.at(-1) || null;
  }
};

const getNumber = (value: string): number | null => {
  const number = Number(value.trim());

  return Number.isFinite(number) && number > 0 ? number : null;
};

const getText = ($: cheerio.CheerioAPI, selector: string): string | null => {
  const value = $(selector).first().text().trim();

  return value || null;
};

export const extractDetailpage = (html: string): DetailAnime => {
  const $ = load(html);

  const obj: DetailAnime = {
    title: null,
    alternativeTitle: null,
    japanese: null,
    id: null,
    poster: null,
    rating: null,
    type: null,
    is18Plus: false,

    episodes: {
      sub: null,
      dub: null,
      eps: null,
    },

    synopsis: null,

    synonyms: null,

    aired: {
      from: null,
      to: null,
    },

    premiered: null,
    duration: null,
    status: null,
    MAL_score: null,

    genres: [],
    studios: [],
    producers: [],

    moreSeasons: [],
    related: [],
    mostPopular: [],
    recommended: [],
  };

  const main = $('#ani_detail');

  if (!main.length) {
    return obj;
  }

  /*
   * ---------------------------------------------------------
   * BASIC INFORMATION
   * ---------------------------------------------------------
   */

  const poster = main
    .find('.anisc-poster .film-poster-img')
    .first();

  obj.poster =
    poster.attr('src') ||
    poster.attr('data-src') ||
    poster.attr('data-lazy-src') ||
    null;

  obj.is18Plus =
    main.find('.anisc-poster .tick-rate').length > 0 ||
    main.find('.film-poster .tick-rate').length > 0;

  const titleElement = main
    .find('.anisc-detail .film-name')
    .first();

  obj.title =
    titleElement.text().trim() ||
    null;

  obj.alternativeTitle =
    titleElement.attr('data-jname')?.trim() ||
    null;

  /*
   * ---------------------------------------------------------
   * ANIME ID
   * ---------------------------------------------------------
   *
   * Current upstream stores the WordPress/anime ID in
   * data-animeid.
   */

  const animeId =
    main.find('[data-animeid]')
      .first()
      .attr('data-animeid') ||
    main.find('.film-fav[data-animeid]')
      .first()
      .attr('data-animeid') ||
    null;

  obj.id = animeId;

  /*
   * ---------------------------------------------------------
   * FILM STATS
   * ---------------------------------------------------------
   */

  const stats = main
    .find('.film-stats')
    .first();

  if (stats.length) {
    obj.rating =
      stats.find('.tick-pg').text().trim() ||
      null;

    obj.episodes.sub =
      getNumber(stats.find('.tick-sub').text());

    obj.episodes.dub =
      getNumber(stats.find('.tick-dub').text());

    obj.episodes.eps =
      getNumber(stats.find('.tick-eps').text()) ||
      obj.episodes.sub;

    const statItems = stats
      .find('.fdi-item, .item');

    if (statItems.length) {
      obj.type =
        statItems
          .first()
          .text()
          .trim() ||
        null;
    }
  }

  /*
   * ---------------------------------------------------------
   * DESCRIPTION
   * ---------------------------------------------------------
   */

  obj.synopsis =
    main
      .find('.film-description .text')
      .first()
      .text()
      .trim() ||
    null;

  /*
   * ---------------------------------------------------------
   * DETAIL INFORMATION
   * ---------------------------------------------------------
   */

  const informationItems = main
    .find('.anisc-info .item');

  informationItems.each((_, element: Element) => {
    const item = $(element);

    const heading = item
      .find('.item-head')
      .text()
      .trim();

    const value =
      item
        .find('.name')
        .text()
        .trim() ||
      item
        .find('.text')
        .text()
        .trim();

    switch (heading) {
      case 'Overview:':
        obj.synopsis = value || obj.synopsis;
        break;

      case 'Japanese:':
        obj.japanese = value || null;
        break;

      case 'Synonyms:':
        obj.synonyms = value || null;
        break;

      case 'Aired:': {
        if (!value) break;

        const parts = value
          .split(/\s+to\s+/i)
          .map((part) => part.trim());

        obj.aired.from =
          parts[0] ||
          null;

        obj.aired.to =
          !parts[1] ||
          parts[1] === '?' ||
          parts[1].toLowerCase() === 'unknown'
            ? null
            : parts[1];

        break;
      }

      case 'Premiered:':
        obj.premiered =
          value ||
          null;
        break;

      case 'Duration:':
        obj.duration =
          value ||
          null;
        break;

      case 'Status:':
        obj.status =
          value ||
          null;
        break;

      case 'MAL Score:':
        obj.MAL_score =
          value ||
          null;
        break;

      case 'Genres:':
        obj.genres = item
          .find('a')
          .map((_, genre: Element) =>
            $(genre)
              .text()
              .trim()
          )
          .get()
          .filter(Boolean);

        break;

      case 'Studios:':
        obj.studios = item
          .find('a')
          .map((_, studio: Element) =>
            $(studio)
              .text()
              .trim()
          )
          .get()
          .filter(Boolean);

        break;

      case 'Producers:':
        obj.producers = item
          .find('a')
          .map((_, producer: Element) =>
            $(producer)
              .text()
              .trim()
          )
          .get()
          .filter(Boolean);

        break;

      default:
        break;
    }
  });

  /*
   * ---------------------------------------------------------
   * FALLBACK INFORMATION SELECTORS
   * ---------------------------------------------------------
   */

  if (!obj.duration) {
    obj.duration =
      getText($, '.anisc-info .item:contains("Duration:") .name');
  }

  if (!obj.status) {
    obj.status =
      getText($, '.anisc-info .item:contains("Status:") .name');
  }

  if (!obj.MAL_score) {
    obj.MAL_score =
      getText($, '.anisc-info .item:contains("MAL Score:") .name');
  }

 
      /* ---------------------------------------------------------
        * MORE SEASONS
      * --------------------------------------------------------- */

      const seasonSelectors = [
  '.block_area-seasons .os-list .os-item',
  '.block_area-seasons .os-list a',
      '.block_area-seasons a.os-item',
      '.block_area-seasons a',
      '.os-list .os-item',
      ];

      const seasonElements = $(seasonSelectors.join(','));

      seasonElements.each((_, element: Element) => {
           const item = $(element);

      const href =
       item.attr('href') ||
        item.find('a').first().attr('href') ||
        null;

      const id = getLastPathSegment(href);

      if (!id) {
        return;
       }

     const title =
      item.attr('title')?.trim() ||
      item.find('.title').first().text().trim() ||
      item.find('.film-name').first().text().trim() ||
      item.text().trim() ||
      null;

    const alternativeTitle =
      item.find('.title').first().attr('data-jname')?.trim() ||
      item.find('.film-name').first().attr('data-jname')?.trim() ||
      null;

     const season: Season = {
     title,
     alternativeTitle,
     id,
     poster: null,
     isActive:
        item.hasClass('active') ||
        item.hasClass('selected') ||
        item.find('.active').length > 0,
     };

    const posterElement = item
      .find('.season-poster, .film-poster-img, img')
      .first();

     season.poster =
      posterElement.attr('data-src') ||
      posterElement.attr('src') ||
      null;

    if (!season.poster) {
     const posterStyle =
      item.find('.season-poster').attr('style');

     if (posterStyle) {
      const match = posterStyle.match(
        /url\((['"]?)(.*?)\1\)/
      );

      if (match?.[2]) {
        season.poster = match[2];
      }
    }
  }

  const alreadyExists = obj.moreSeasons.some(
    (existingSeason) =>
      String(existingSeason.id) === String(season.id)
  );

  if (!alreadyExists) {
    obj.moreSeasons.push(season);
  }
});

  /*
   * ---------------------------------------------------------
   * RELATED / MOST POPULAR
   * ---------------------------------------------------------
   */

  const createFeaturedAnime = (
    element: Element
  ): AnimeFeatured => {
    const item = $(element);

    const titleElement =
      item.find(
        '.film-detail .film-name a, .film-detail .film-name .dynamic-name'
      ).first();

    const stats =
      item.find('.fd-infor').first();

    const poster =
      item
        .find('.film-poster .film-poster-img')
        .first();

    const result: AnimeFeatured = {
      title:
        titleElement.text().trim() ||
        null,

      alternativeTitle:
        titleElement.attr('data-jname') ||
        null,

      id:
        getLastPathSegment(titleElement.attr('href')),

      poster:
        poster.attr('data-src') ||
        poster.attr('src') ||
        null,

      type:
        stats.find('.fdi-item').first().text().trim() ||
        null,

      episodes: {
        sub:
          getNumber(item.find('.tick-sub').text()),

        dub:
          getNumber(item.find('.tick-dub').text()),

        eps:
          getNumber(item.find('.tick-eps').text()) ||
          getNumber(item.find('.tick-sub').text()),
      },
    };

    return result;
  };

  /*
   * Current pages commonly have sidebar blocks.
   */

  const sidebarBlocks =
    main
      .parent()
      .find(
        '.block_area_sidebar .cbox-list, .hianime-mostpopular-widget'
      );

  if (sidebarBlocks.length) {
    sidebarBlocks.each((index, block: Element) => {
      const items =
        $(block).find(
          '.ulclear > li, .anif-block-ul li'
        );

      const target =
        index === 0
          ? obj.mostPopular
          : obj.related;

      items.each((_, element: Element) => {
        target.push(
          createFeaturedAnime(element)
        );
      });
    });
  }

  /*
   * Fallback: identify sections by headings.
   */

  $('.block_area').each((_, block: Element) => {
    const blockElement = $(block);

    const heading =
      blockElement
        .find(
          '.cat-heading, .block_area-header .cat-heading, .cbox-title'
        )
        .first()
        .text()
        .trim()
        .toLowerCase();

    const items =
      blockElement.find(
        '.film_list-wrap .flw-item, .anif-block-ul li'
      );

    if (!items.length) return;

    if (
      heading.includes('recommended')
    ) {
      obj.recommended.length = 0;

      items.each((_, element: Element) => {
        const item = createFeaturedAnime(element) as AnimeFeatured & {
          duration?: string | null;
          is18Plus?: boolean;
        };

        item.duration =
          $(element)
            .find('.fdi-duration')
            .text()
            .trim() ||
          null;

        item.is18Plus =
          $(element)
            .find('.tick-rate')
            .length > 0;

        obj.recommended.push(item);
      });
    }
  });

  /*
   * ---------------------------------------------------------
   * RECOMMENDED
   * ---------------------------------------------------------
   */

  if (!obj.recommended.length) {
    $(
      '.block_area_category .film_list-wrap .flw-item, ' +
      '.block_area_home .film_list-wrap .flw-item'
    ).each((_, element: Element) => {
      const item =
        createFeaturedAnime(element) as AnimeFeatured & {
          duration?: string | null;
          is18Plus?: boolean;
        };

      item.duration =
        $(element)
          .find('.fdi-duration')
          .text()
          .trim() ||
        null;

      item.is18Plus =
        $(element)
          .find('.tick-rate')
          .length > 0;

      obj.recommended.push(item);
    });
  }

  return obj;
};