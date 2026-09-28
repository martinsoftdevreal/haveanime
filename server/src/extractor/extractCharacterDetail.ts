import { load } from 'cheerio';

export interface AnimeAppearance {
  title: string | null;
  alternativeTitle: string | null;
  id: string | null;
  poster: string | null;
  role: string | null;
  type: string | null;
}

export interface VoiceActorShort {
  name: string | null;
  imageUrl: string | null;
  id: string | null;
  language: string | null;
}

export interface VoiceActingRole {
  anime: {
    title: string | null;
    poster: string | null;
    id: string | null;
    typeAndYear: string | null;
  };

  character: {
    name: string | null;
    imageUrl: string | null;
    id: string | null;
    role: string | null;
  };
}

export interface CharacterDetail {
  name: string | null;

  type:
    | 'people'
    | 'character'
    | string;

  japanese: string | null;

  imageUrl: string | null;

  bio: string | null;

  animeAppearances?: AnimeAppearance[];

  voiceActors?: VoiceActorShort[];

  voiceActingRoles?: VoiceActingRole[];
}

const transformId = (
  value?: string
): string | null => {
  if (!value) return null;

  return value
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace('/', ':');
};

export const extractCharacterDetail = (
  html: string
): CharacterDetail => {
  const $ =
    load(html);

  const obj: CharacterDetail = {
    name: null,

    type: 'character',

    japanese: null,

    imageUrl: null,

    bio: null,

    animeAppearances: [],

    voiceActors: [],

    voiceActingRoles: [],
  };

  /*
   * ---------------------------------------------------------
   * LEGACY CHARACTER PAGE
   * ---------------------------------------------------------
   */

  const characterPage =
    $('.actor-page-wrap');

  if (!characterPage.length) {
    /*
     * Current upstream does not expose the old character
     * detail page. Return an empty, type-safe object.
     */

    return obj;
  }

  /*
   * ---------------------------------------------------------
   * TYPE
   * ---------------------------------------------------------
   */

  const breadcrumb =
    $('nav .breadcrumb')
      .text()
      .toLowerCase();

  obj.type =
    breadcrumb.includes('people')
      ? 'people'
      : 'character';

  /*
   * ---------------------------------------------------------
   * BASIC DETAILS
   * ---------------------------------------------------------
   */

  obj.imageUrl =
    characterPage
      .find('.avatar img')
      .first()
      .attr('src') ||
    characterPage
      .find('.avatar img')
      .first()
      .attr('data-src') ||
    null;

  const details =
    $('.apw-detail');

  obj.name =
    details
      .find('.name')
      .first()
      .text()
      .trim() ||
    null;

  obj.japanese =
    details
      .find('.sub-name')
      .first()
      .text()
      .trim() ||
    null;

  obj.bio =
    details
      .find(
        '#bio .bio, #bio'
      )
      .first()
      .html()
      ?.trim() ||
    null;

  /*
   * ---------------------------------------------------------
   * CHARACTER → ANIME APPEARANCES
   * ---------------------------------------------------------
   */

  if (
    obj.type === 'character'
  ) {
    details
      .find(
        '#animeography .anif-block-ul .ulclear li'
      )
      .each(
        (_, element) => {
          const item =
            $(element);

          const title =
            item
              .find(
                '.dynamic-name, .film-name a'
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

          obj.animeAppearances?.push({
            title:
              title
                .attr('title') ||
              title
                .text()
                .trim() ||
              null,

            alternativeTitle:
              title
                .attr('data-jname') ||
              null,

            id:
              transformId(
                title.attr('href')
              ),

            poster:
              poster.attr('data-src') ||
              poster.attr('src') ||
              null,

            role:
              info
                .find('.fdi-item')
                .first()
                .text()
                .trim() ||
              null,

            type:
              info
                .find('.fdi-item')
                .last()
                .text()
                .trim() ||
              null,
          });
        }
      );

    /*
     * -------------------------------------------------------
     * VOICE ACTORS
     * -------------------------------------------------------
     */

    details
      .find(
        '#voiactor .sub-box-list .per-info'
      )
      .each(
        (_, element) => {
          const item =
            $(element);

          const actor =
            item
              .find('.pi-name a')
              .first();

          obj.voiceActors?.push({
            name:
              actor
                .text()
                .trim() ||
              null,

            imageUrl:
              item
                .find('.pi-avatar img')
                .attr('data-src') ||
              item
                .find('.pi-avatar img')
                .attr('src') ||
              null,

            id:
              transformId(
                actor.attr('href')
              ),

            language:
              item
                .find('.pi-cast')
                .text()
                .trim() ||
              null,
          });
        }
      );
  }

  /*
   * ---------------------------------------------------------
   * PEOPLE → VOICE ACTING ROLES
   * ---------------------------------------------------------
   */

  if (
    obj.type === 'people'
  ) {
    $('#voice .bac-list-wrap .bac-item')
      .each(
        (_, element) => {
          const item =
            $(element);

          const animeInfo =
            item
              .find('.per-info.anime-info')
              .first();

          const characterInfo =
            item
              .find('.per-info.rtl')
              .first();

          const animeTitle =
            animeInfo
              .find('.pi-name a')
              .first();

          const characterTitle =
            characterInfo
              .find('.pi-name a')
              .first();

          obj.voiceActingRoles?.push({
            anime: {
              title:
                animeTitle
                  .text()
                  .trim() ||
                null,

              poster:
                animeInfo
                  .find('.pi-avatar img')
                  .attr('data-src') ||
                animeInfo
                  .find('.pi-avatar img')
                  .attr('src') ||
                null,

              id:
                transformId(
                  animeTitle.attr('href')
                ),

              typeAndYear:
                animeInfo
                  .find('.pi-cast')
                  .text()
                  .trim() ||
                null,
            },

            character: {
              name:
                characterTitle
                  .text()
                  .trim() ||
                null,

              imageUrl:
                characterInfo
                  .find('.pi-avatar img')
                  .attr('data-src') ||
                characterInfo
                  .find('.pi-avatar img')
                  .attr('src') ||
                null,

              id:
                transformId(
                  characterTitle.attr('href')
                ),

              role:
                characterInfo
                  .find('.pi-cast')
                  .text()
                  .trim() ||
                null,
            },
          });
        }
      );
  }

  return obj;
};