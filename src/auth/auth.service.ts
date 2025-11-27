import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/users.schema';
import { UserRole } from '../common/enums/role.enum';
import { SafeUser } from '../common/interfaces/safe-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async hash(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  async register(
    _adminUserId: string,
    dto: { fullName: string; email: string; password: string; role?: string },
  ): Promise<SafeUser> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await this.hash(dto.password);
    const roleValue = (dto.role as UserRole) ?? UserRole.INVENTORY_MANAGER;
    const userPayload: Partial<User> = {
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      role: roleValue,
    };

    const created = await this.usersService.create(userPayload);
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      passwordHash: _pw,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      refreshTokenHash: _rt,
      ...safeUser
    } = created.toObject() as User & { _id: string };

    return safeUser;
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    return isMatch ? user : null;
  }

  private async getTokens(
    userId: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET!,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }

  async login(dto: { email: string; password: string }): Promise<{
    user: SafeUser;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.getTokens(user._id.toString(), user.role);
    const refreshTokenHash = await this.hash(tokens.refreshToken);
    await this.usersService.setRefreshToken(
      user._id.toString(),
      refreshTokenHash,
    );

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      passwordHash,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      refreshTokenHash: _rt,
      ...safeUser
    } = user.toObject() as User & { _id: string };

    return { user: safeUser, tokens };
  }

  async refreshTokensFromCookie(
    providedRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(providedRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findByUserId(payload.sub);
    if (!user || !user.refreshTokenHash)
      throw new UnauthorizedException('Please login');

    const isValid = await bcrypt.compare(
      providedRefreshToken,
      user.refreshTokenHash,
    );
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.getTokens(user._id.toString(), user.role);
    const newRefreshHash = await this.hash(tokens.refreshToken);
    await this.usersService.setRefreshToken(
      user._id.toString(),
      newRefreshHash,
    );

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.setRefreshToken(userId, null);
  }
}
