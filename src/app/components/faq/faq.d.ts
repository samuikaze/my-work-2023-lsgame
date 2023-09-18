export declare interface GetFaqListResponse {
  faqList: Array<Faq>;
  totalPages: number;
}

export declare interface Faq {
  faqId: number;
  faqQuestion: string;
  faqAnswer: string;
  createdAt: Date;
  createdUserId: number;
  updatedAt: Date;
  updatedUserId: number;
}

export declare interface FaqStatuses {
  gettingFaq: boolean;
}
