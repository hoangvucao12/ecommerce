export interface AccessTokenPayloadCreate {
  userId: number;
  deviceId: number;
  roleName: string;
  roleId: number;
}

export interface AccessTokenPayload extends AccessTokenPayloadCreate {
  exp: number;
  iat: number;
}

export interface RefreshTokenPayloadCreate {
  userId: number;
  deviceId: number;
}

export interface RefreshTokenPayload extends RefreshTokenPayloadCreate {
  exp: number;
  iat: number;
}

export interface OAuthStatePayload {
  userAgent: string;
  ip: string;
  exp: number;
  iat: number;
}
