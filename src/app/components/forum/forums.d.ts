export declare interface Board {
  id: number;
  user_id?: number;
  open_user?: string;
  name: string;
  board_image: string;
  description: string;
  show: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export declare interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export declare interface PostEdit {
  boardId?: number;
  postId?: number;
  title: string;
  category?: number;
  content: string;
}

export declare interface Post {
  id: number;
  board_id: number;
  post_user_id: number;
  category_id: number;
  category: string;
  title: string;
  content: string;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  replies_quantity?: number;
  last_operation_at?: string;
  post_user?: string;
}

export declare interface ReplyEdit {
  boardId?: number;
  postId?: number;
  replyId?: number;
  title: string | null;
  content: string;
}

export declare interface ReplyList {
  replies: Reply[];
  totalPages: number;
}

export declare interface Reply {
  id: number;
  post_user_id: number;
  post_id: number;
  title?: string;
  content: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

