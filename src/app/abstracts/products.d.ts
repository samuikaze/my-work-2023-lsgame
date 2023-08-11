export declare interface ProductList {
  productList: Products[];
  totalPages: number;
}

export declare interface Products {
  id: number;
  title: string;
  visual_image: string;
  description: string;
  product_url?: string;
  type: string;
  release_at: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  platforms: string[];
}
