import { Modal } from "bootstrap";

export declare interface Modals {
  [key: string]: Modal
}

export declare interface SignIn {
  account: string;
  password: string;
  remember: boolean;
}

export declare interface SignUp {
  account: string;
  email: string;
  password: string;
  password_confirmation: string;
  name: string;
}
