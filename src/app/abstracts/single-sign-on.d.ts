import { TokenType } from "../enums/token-type";

export declare interface Role {
  id: number;
  name: string;
  description: string;
}

export declare interface Ability {
  id: number;
  name: string;
  description: string;
}

export declare interface SignInResponse {
  user: TokenUser;
  accessToken: Token;
  refreshToken: Token;
}

export declare interface Token {
  tokenType: string;
  token: string;
}

export declare interface UserInformation {
  id: number;
  account: string;
  username: string;
}

export declare interface TokenUser {
  exp?: number;
  iat?: Date | null;
  iss?: string;
  sub?: string;
  jti?: string;
  nbf?: number;
  userId?: number;
  account?: string;
  roles?: Array<Role>;
  scope?: Array<string>;
  tokenType?: TokenType;
  username?: string;
}

export declare interface Account {
  id?: number;
  username?: string;
  account?: string;
  email?: string;
  emailVerifiedAt?: Date;
  virtualAvator?: string;
  roles?: Array<Role>;
  abilities?: Array<Ability>;
  registerdAt?: Date;
  updatedAt?: string;
}

export declare interface User extends TokenUser, Account {}

export declare interface UpdateUser extends Account {
  username?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

export declare interface RefreshTokenPayloads {
  account: string;
  exp: number;
  iat: Date;
  iss: string;
  jti: string;
  nbf: number;
  sub: string;
  tokenType: TokenType;
  userId: number;
  username: string;
}

export declare interface UpdateUserResponse {
  id: number;
  userId: number;
  account: string;
  email: string;
  username: string;
  emailVerifiedAt?: Date;
}

export declare interface SystemAccessTokenRequest {
  system: string;
  accessToken: string;
  refreshToken: string;
}
