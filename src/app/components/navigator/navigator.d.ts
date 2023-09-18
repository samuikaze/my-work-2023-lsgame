import { Modal } from "bootstrap";

export interface NavigatorStatuses {
  signInPWVisible: boolean;
  signUpPWVisible: boolean;
  signUpPWConfirmVisible: boolean;
  signUping: boolean;
  loaded: boolean;
  logining: boolean;
  logined: boolean;
  updatingUser: boolean;
}

export declare interface Modals {
  [key: string]: Modal
}

export declare interface SignIn {
  account: string;
  password: string;
}

export declare interface SignUp {
  account: string;
  email: string;
  password: string;
  password_confirmation: string;
  username: string;
}

export declare interface SelectedImage {
  dataurl: string;
  filename: string;
  size: number;
}
