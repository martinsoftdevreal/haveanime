import { load } from 'cheerio';

export interface Episode {
  title: string | null;
  alternativeTitle: string | null;
  id: string | null;
  isFiller: boolean;
  episodeNumber: number;
}

const getEpisodeNumber = (
  value: string | undefined,
  fallback: number
): number => {
  if (!value) return fallback;

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

export const extractEpisodes = (
  html: string
): Episode[] => {
  const $ = load(html);

  const response: Episode[] = [];

  $('.ssl-item.ep-item').each(
    (index, element) => {
      const item = $(element);

      const episodeNumber =
        getEpisodeNumber(
          item.attr('data-number'),
          index + 1
        );

      const href =
        item.attr('href') ||
        null;

      const title =
        item.find('.ep-name').text().trim() ||
        item.attr('title')?.trim() ||
        null;

      const alternativeTitle =
        item
          .find('.ep-name')
          .attr('data-jname')
          ?.trim() ||
        null;

      const id =
        item.attr('data-id') ||
        href ||
        null;

      const episode: Episode = {
        title,
        alternativeTitle,
        id,
        isFiller:
          item.hasClass('ssl-item-filler') ||
          item.hasClass('filler'),

        episodeNumber,
      };

      response.push(episode);
    }
  );

  return response;
};