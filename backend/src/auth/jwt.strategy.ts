import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'pingpong_booking_secret',
    });
  }

  async validate(payload: { sub: number; username: string }) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) return null;
    return { id: user.id, username: user.username, credit_score: user.credit_score, banned_until: user.banned_until };
  }
}
