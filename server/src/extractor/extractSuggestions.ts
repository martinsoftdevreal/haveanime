import { load } from 'cheerio';
import { Element } from 'domhandler';

export interface Suggestion {
  title: string | null;
  alternativeTitle: string | null;
  poster: string | null;
  id: string | null;
  aired: string | null;
  type: string | null;
  duration: string | null;
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

    const parts =
      url.pathname
        .split('/')
        .filter(Boolean);

    return parts.at(-1) || null;
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

export const extractSuggestions = (
  html: string
): Suggestion[] => {
  const $ = load(html);

  const response: Suggestion[] = [];

  $('.nav-item').each(
    (_, element: Element) => {
      const item = $(element);

      const href =
        item.attr('href');

      /*
       * Ignore navigation elements that
       * are not anime suggestions.
       */

      if (
        !href ||
        !href.includes('/anime/')
      ) {
        return;
      }

      const titleElement =
        item.find('.film-name').first();

      const info =
        item.find('.film-infor').first();

      const suggestion: Suggestion = {
        title:
          titleElement
            .text()
            .trim() ||
          null,

        alternativeTitle:
          titleElement
            .attr('data-jname') ||
          null,

        poster:
          item
            .find('.film-poster-img')
            .attr('data-src') ||
          item
            .find('.film-poster-img')
            .attr('src') ||
          null,

        id:
          getLastPathSegment(href),

        aired:
          info
            .find('span')
            .first()
            .text()
            .trim() ||
          null,

        type:
          info
            .contents()
            .filter(
              (_, child) =>
                child.type === 'text' &&
                $(child)
                  .text()
                  .trim() !== ''
            )
            .text()
            .trim() ||
          null,

        duration:
          info
            .find('span')
            .last()
            .text()
            .trim() ||
          null,
      };

      response.push(
        suggestion
      );
    }
  );

  return response;
};