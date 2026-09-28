import { Context } from 'hono';

import { validationError } from '../utils/errors';

import {
  extractSchedule,
  ScheduledAnime,
} from '../extractor/extractSchedule';

import { axiosInstance } from '../services/axiosInstance';

interface ScheduleResult {
  [date: string]: ScheduledAnime[];
}

const schedulesController = async (
  c: Context
): Promise<ScheduleResult> => {
  const dateParam =
    c.req.query('date')?.trim();

  let startDate = new Date();

  if (dateParam) {
    const match =
      /^(\d{4})-(\d{2})-(\d{2})$/.exec(
        dateParam
      );

    if (!match) {
      throw new validationError(
        'Invalid date format. Use YYYY-MM-DD'
      );
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    startDate = new Date(
      year,
      month - 1,
      day
    );

    if (
      startDate.getFullYear() !== year ||
      startDate.getMonth() !== month - 1 ||
      startDate.getDate() !== day
    ) {
      throw new validationError(
        'Invalid date'
      );
    }
  }

  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const date =
      new Date(startDate);

    date.setDate(
      startDate.getDate() + i
    );

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    dates.push(
      `${year}-${month}-${day}`
    );
  }

  const results =
    await Promise.all(
      dates.map(async (date) => {
        try {
          const timezoneOffset =
            -new Date(
              `${date}T12:00:00`
            ).getTimezoneOffset();

          const endpoint =
            `/wp-json/hianime/v1/schedule/day?tzOffset=${timezoneOffset}&date=${date}`;

          const result =
            await axiosInstance(endpoint);

          if (
            !result.success ||
            !result.data
          ) {
            throw new Error(
              result.message ||
                'Failed to fetch schedule'
            );
          }

          let html =
            result.data;

          /*
           * The upstream endpoint currently
           * returns JSON as a string:
           *
           * {
           *   success: true,
           *   html: "<li>...</li>"
           * }
           *
           * Parse it first.
           */
          if (
            typeof html === 'string'
          ) {
            try {
              const parsed =
                JSON.parse(html);

              if (
                typeof parsed?.html ===
                'string'
              ) {
                html =
                  parsed.html;
              } else if (
                typeof parsed?.data?.html ===
                'string'
              ) {
                html =
                  parsed.data.html;
              }
            } catch {
              /*
               * It is already HTML.
               */
            }
          }

          /*
           * Extract schedule items.
           */
          const shows =
            typeof html === 'string'
              ? extractSchedule(html)
              : [];

          return {
            date,
            shows,
          };
        } catch (error) {
          console.error(
            `Failed to fetch schedule for ${date}:`,
            error instanceof Error
              ? error.message
              : error
          );

          return {
            date,
            shows:
              [] as ScheduledAnime[],
          };
        }
      })
    );

  const response:
    ScheduleResult = {};

  for (const result of results) {
    response[result.date] =
      result.shows;
  }

  return response;
};

export default schedulesController;