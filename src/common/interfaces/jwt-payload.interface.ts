export interface JwtPayload {
  sub: string;
  userId?: string;
  email?: string;
  role: string;
  iat?: number;
  exp?: number;
}
