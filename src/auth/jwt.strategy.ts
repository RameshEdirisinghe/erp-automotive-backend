import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return (
            req?.cookies?.access_token ||
            req?.headers?.authorization?.split(' ')[1]
          );
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'CHANGE_ME',
    });
  }

  validate(payload: JwtPayload) {
    if (!payload) throw new UnauthorizedException('Invalid JWT payload');
    return payload;
  }
}
