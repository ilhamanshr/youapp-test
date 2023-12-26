import * as moment from 'moment';

export enum HoroscopeEnum {
  ARIES = 'Aries',
  TAURUS = 'Taurus',
  GEMINI = 'Gemini',
  CANCER = 'Cancer',
  LEO = 'Leo',
  VIRGO = 'Virgo',
  LIBRA = 'Libra',
  SCORPIUS = 'Scorpius',
  SAGITTARIUS = 'Sagittarius',
  CAPRICORNUS = 'Capricornus',
  AQUARIUS = 'Aquarius',
  PISCES = 'Pisces',
}

export const HoroscopeDateRanges: Record<
  HoroscopeEnum,
  { start: string; end: string }
> = {
  [HoroscopeEnum.ARIES]: { start: '03-21', end: '04-19' },
  [HoroscopeEnum.TAURUS]: { start: '04-20', end: '05-20' },
  [HoroscopeEnum.GEMINI]: { start: '05-21', end: '06-21' },
  [HoroscopeEnum.CANCER]: { start: '06-22', end: '07-22' },
  [HoroscopeEnum.LEO]: { start: '07-23', end: '08-22' },
  [HoroscopeEnum.VIRGO]: { start: '08-23', end: '09-22' },
  [HoroscopeEnum.LIBRA]: { start: '09-23', end: '10-23' },
  [HoroscopeEnum.SCORPIUS]: { start: '10-24', end: '11-21' },
  [HoroscopeEnum.SAGITTARIUS]: { start: '11-22', end: '12-21' },
  [HoroscopeEnum.CAPRICORNUS]: { start: '12-22', end: '01-19' },
  [HoroscopeEnum.AQUARIUS]: { start: '01-20', end: '02-18' },
  [HoroscopeEnum.PISCES]: { start: '02-19', end: '03-20' },
};

export function getHoroscope(dateString: string): HoroscopeEnum {
  const birthDate = moment(dateString, 'YYYY-MM-DD');
  const monthDay = birthDate.format('MM-DD');

  for (const sign in HoroscopeDateRanges) {
    const { start, end } = HoroscopeDateRanges[sign];
    if (monthDay >= start && monthDay <= end) {
      return sign as HoroscopeEnum;
    }
  }

  return null;
}
