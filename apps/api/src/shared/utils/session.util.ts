import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { User } from '@repo/database';

import type { SessionMetadata } from '../types/session-metadata.types';

export function saveSession(
  req: Request,
  user: User,
  metadata: SessionMetadata,
) {
  return new Promise((resolve, reject) => {
    (req.session as any).createdAt = new Date();
    (req.session as any).userId = user.id;
    (req.session as any).metadata = metadata;

    req.session.save((err) => {
      if (err) {
        return reject(
          new InternalServerErrorException('Not able to save session'),
        );
      }

      resolve({ user });
    });
  });
}

export function destroySession(req: Request, configService: ConfigService) {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        return reject(
          new InternalServerErrorException('Not able to destroy session'),
        );
      }

      if (req.res) {
        req.res.clearCookie(configService.getOrThrow<string>('SESSION_NAME'));
      }

      resolve(true);
    });
  });
}
