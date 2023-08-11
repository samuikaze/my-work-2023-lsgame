export declare interface BackendCart {
  id: number;
  quantity: number;
  price: number;
}

export declare interface Cart {
  id: number;
  name: string;
  prices: number;
  quantity: number;
  image?: string;
  description?: string;
}

export declare interface Good {
  id: number;
  up_user: string;
  name: string;
  preview_image: string;
  description: string;
  price: number;
  quantity: number;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
