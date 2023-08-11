export declare interface NewsList {
  newsList: News[];
  totalPages: number;
}

export declare interface News {
  id: number;
  user_id: number;
  type: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
