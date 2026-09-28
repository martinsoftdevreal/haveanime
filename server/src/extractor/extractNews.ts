import * as cheerio from 'cheerio';

export interface News {
  id: string | null;
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  uploadedAt: string | null;
  url: string | null;
}

export interface NewsResponse {
  news: News[];
  total: number;
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

export const extractNews = (
  html: string
): NewsResponse => {
  const $ =
    cheerio.load(html);

  const news: News[] = [];

  /*
   * Current theme may use the old
   * .zr-news-list structure or a
   * generic WordPress news card.
   */

  const selectors = [
    '.zr-news-list .item',
    '.news-list .item',
    '.news-item',
    'article.news-item',
  ];

  let items =
    $(selectors.join(', '));

  /*
   * If current page contains no news
   * cards, return an empty response.
   */

  if (!items.length) {
    return {
      news: [],
      total: 0,
    };
  }

  items.each((_, element) => {
    const item =
      $(element);

    const link =
      item
        .find(
          '.zrn-title, .news-title a, h2 a, h3 a'
        )
        .first()
        .attr('href') ||
      item
        .find('a[href]')
        .first()
        .attr('href') ||
      null;

    const title =
      item
        .find(
          '.news-title, .zrn-title, h2, h3'
        )
        .first()
        .text()
        .trim() ||
      null;

    const description =
      item
        .find(
          '.description, .excerpt, .news-excerpt'
        )
        .first()
        .text()
        .trim() ||
      null;

    const thumbnail =
      item
        .find(
          '.zrn-image, img'
        )
        .first()
        .attr('src') ||
      item
        .find(
          '.zrn-image, img'
        )
        .first()
        .attr('data-src') ||
      null;

    const uploadedAt =
      item
        .find(
          '.time-posted, .post-date, time'
        )
        .first()
        .text()
        .trim() ||
      null;

    if (!title) {
      return;
    }

    news.push({
      id:
        getLastPathSegment(link),

      title,

      description,

      thumbnail,

      uploadedAt,

      url: link,
    });
  });

  return {
    news,
    total: news.length,
  };
};