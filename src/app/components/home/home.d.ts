export declare interface HomeStatus {
  news: boolean;
  carousel: boolean;
}

export declare interface Carousel {
  carouselId: number;
  carouselTitle: string;
  carouselImagePath: string;
  description: string;
  link: string;
  createdUserId: number;
  createdAt: Date;
  updatedUserId: number;
  updatedAt: Date;
}

export declare interface GetCarouselListResponse {
  carouselList: Array<Carousel>;
  totalPages: number;
}
