export declare interface Role {
  id: number;
  name: string;
}

export declare interface SignInResponse {
  user: User;
  accessToken: Token;
  refreshToken: Token;
}

export declare interface Token {
  type: string;
  token: string;
}

export declare interface UserInformation {
  id: number;
  name: string;
}

export declare interface User {
  id?: number;
  name?: string;
  account?: string;
  email?: string;
  email_verified_at?: string;
  roles?: Role[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export declare interface ModifyUser extends User {
  password?: string;
  passwordConfirmation?: string;
}
