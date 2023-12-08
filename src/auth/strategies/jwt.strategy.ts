import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DbService } from 'src/db/db.service';
import { JwtPayload } from '../interfaces/jwt-payload.interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly dbService: DbService,
    private configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: any): Promise<User> {
    const { id } = payload;
    if (!id) throw new UnauthorizedException('TOKEN_INVALID');

    const user = await this.dbService.user.findUnique({
      where: { id: +id },
    });
    if (!user) throw new UnauthorizedException('TOKEN_INVALID');

    if (!user.isActive) throw new UnauthorizedException('USER_NOT_ACTIVE');
    return user;
  }
}
