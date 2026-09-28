import { load } from 'cheerio';

export interface Character {
  name: string | null;
  id: string | null;
  imageUrl: string | null;
  role: string | null;
  voiceActors: VoiceActor[];
}

export interface VoiceActor {
  name: string | null;
  id: string | null;
  imageUrl: string | null;
  cast?: string | null;
}

export interface CharactersResponse {
  pageInfo?: {
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
  };

  response: Character[];
}

export const extractCharacters = (
  html: string
): CharactersResponse => {
  const $ =
    load(html);

  const response: Character[] = [];

  /*
   * ---------------------------------------------------------
   * LEGACY CHARACTER STRUCTURE
   * ---------------------------------------------------------
   *
   * Kept as a compatibility extractor in case the upstream
   * ever returns the old character HTML again.
   */

  const characters =
    $('.bac-item');

  if (!characters.length) {
    return {
      pageInfo: {
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
      },

      response: [],
    };
  }

  const pagination =
    $('.pre-pagination .pagination .page-item');

  let currentPage = 1;
  let totalPages = 1;
  let hasNextPage = false;

  if (pagination.length) {
    currentPage =
      Number(
        pagination
          .find('.active .page-link')
          .first()
          .text()
          .trim()
      ) || 1;

    const numbers =
      pagination
        .find('.page-link')
        .map((_, element) =>
          Number(
            $(element)
              .text()
              .trim()
          )
        )
        .get()
        .filter(
          (number) =>
            Number.isFinite(number) &&
            number > 0
        );

    if (numbers.length) {
      totalPages =
        Math.max(...numbers);
    }

    hasNextPage =
      pagination
        .find(
          '.page-item.next:not(.disabled)'
        )
        .length > 0;
  }

  characters.each(
    (_, element) => {
      const item =
        $(element);

      const characterInfo =
        item
          .find('.per-info')
          .first();

      const characterLink =
        characterInfo
          .find('.pi-avatar')
          .attr('href') ||
        characterInfo
          .find('.pi-name a')
          .attr('href');

      const character: Character = {
        name:
          characterInfo
            .find('.pi-detail .pi-name a')
            .text()
            .trim() ||
          null,

        id:
          characterLink
            ? characterLink
                .replace(/^\//, '')
            : null,

        imageUrl:
          characterInfo
            .find('.pi-avatar img')
            .attr('data-src') ||
          characterInfo
            .find('.pi-avatar img')
            .attr('src') ||
          null,

        role:
          characterInfo
            .find('.pi-detail .pi-cast')
            .text()
            .trim() ||
          null,

        voiceActors: [],
      };

      const voiceActors =
        item
          .find(
            '.per-info-xx, .rtl'
          );

      if (
        voiceActors.length
      ) {
        voiceActors.each(
          (_, voiceElement) => {
            const voice =
              $(voiceElement);

            const actorLink =
              voice
                .find('.pi-avatar')
                .attr('href') ||
              voice
                .find('.pi-name a')
                .attr('href');

            character.voiceActors.push({
              name:
                voice
                  .find(
                    '.pi-name a'
                  )
                  .text()
                  .trim() ||
                voice
                  .find(
                    '.pi-avatar img'
                  )
                  .attr('alt') ||
                null,

              id:
                actorLink
                  ? actorLink
                      .replace(/^\//, '')
                  : null,

              imageUrl:
                voice
                  .find(
                    '.pi-avatar img'
                  )
                  .attr('data-src') ||
                voice
                  .find(
                    '.pi-avatar img'
                  )
                  .attr('src') ||
                null,

              cast:
                voice
                  .find('.pi-cast')
                  .text()
                  .trim() ||
                null,
            });
          }
        );
      }

      response.push(character);
    }
  );

  return {
    pageInfo: {
      totalPages,
      currentPage,
      hasNextPage,
    },

    response,
  };
};