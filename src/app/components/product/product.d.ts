export declare interface ProductList {
  productList: Array<Product>;
  totalPages: number;
}

export declare interface Product {
  productId: number;
  productTitle: string;
  visualImage: string;
  description: string;
  productUrl: string;
  productTypeId: number;
  productPlatforms: Array<number>;
  releaseDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export declare interface ProductType {
  productTypeId: number;
  productTypeName: string;
  createdAt: Date;
  updatedAt: Date;
}

export declare interface Platform {
  productPlatformId: number;
  productPlatformName: string;
  createdAt: Date;
  updatedAt: Date;
}
