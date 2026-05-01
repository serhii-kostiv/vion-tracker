import type { Request } from 'express';
import { lookup } from 'geoip-lite';
import * as countries from 'i18n-iso-countries';
import DeviceDetector from 'device-detector-js';
import en from 'i18n-iso-countries/langs/en.json';

import { SessionMetadata } from '../types/session-metadata.types';

import { IS_DEV_ENV } from './is-dev.util';

countries.registerLocale(en);

export function getSessionMetadata(
  req: Request,
  userAgent: string,
): SessionMetadata {
  const ip = IS_DEV_ENV
    ? '173.166.164.121'
    : Array.isArray(req.headers['cf-connecting-ip'])
      ? req.headers['cf-connecting-ip'][0]
      : req.headers['cf-connecting-ip'] ||
        (typeof req.headers['x-forwarded-for'] === 'string'
          ? req.headers['x-forwarded-for'].split(',')[0]
          : req.ip) ||
        'Unknown';

  const location = lookup(ip);

  const device = new DeviceDetector().parse(userAgent);
  return {
    location: {
      country: countries.getName(location?.country || '', 'en') || 'Unknown',
      city: location?.city || 'Unknown',
      latidute: location?.ll?.[0] || 0,
      longitude: location?.ll?.[1] || 0,
    },
    device: {
      browser: device.client?.name || 'Unknown',
      os: device.os?.name || 'Unknown',
      type: device.device?.type || 'Unknown',
    },
    ip,
  };
}

export async function setSessionMetadata(session: any): Promise<void> {
  return new Promise((resolve, reject) => {
    session.save((err: any) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}
