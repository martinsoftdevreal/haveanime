import { load } from 'cheerio';

export interface EpisodeServer {
  type: string;
  name: string;
  hash: string;
}

export const extractEpisodeServers = (
  html: string
): EpisodeServer[] => {
  const $ = load(html);

  const response: EpisodeServer[] = [];

  $('.item.server-item, .itemserver-item').each(
    (_index, element) => {
      const item = $(element);

      const type = item.attr('data-type')?.trim() || '';
      const name =
        item.attr('data-server-name')?.trim() || '';
      const hash =
        item.attr('data-hash')?.trim() || '';

      if (!type && !name && !hash) {
        return;
      }

      response.push({
        type,
        name,
        hash,
      });
    }
  );

  return response;
};

export default extractEpisodeServers;