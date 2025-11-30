import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import type { Request, Response } from 'express';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as
        | 'lax'
        | 'strict'
        | 'none',
      maxAge,
      path: '/',
    };
  }

  private setAuthCookies(res: Response, access: string, refresh: string) {
    const accessOptions = this.getCookieOptions(15 * 60 * 1000); // 15 min
    const refreshOptions = this.getCookieOptions(7 * 24 * 60 * 60 * 1000); // 7 days

    res.cookie('access_token', access, accessOptions);
    res.cookie('refresh_token', refresh, refreshOptions);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('register')
  async register(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AuthRegisterDto,
  ) {
    const adminUserId = req.user?.userId ?? req.user?.sub;
    if (!adminUserId) throw new UnauthorizedException('Admin user not found');
    return this.authService.register(adminUserId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(dto);

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return { user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string> | undefined)
      ?.refresh_token;

    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    const tokens = await this.authService.refreshTokensFromCookie(refreshToken);

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.userId ?? req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');

    await this.authService.logout(userId);

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    return { success: true };
  }
}
