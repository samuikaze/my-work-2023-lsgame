export declare interface BaseParams {
  [key: string]: string | number | boolean;
}

export declare interface BaseResponse<T> {
  status: number;
  message: string|null;
  data: T;
}

export declare interface CustomerHeaders {
  [key: string]: string;
}

export declare interface RequestBody {
  [key: string]: any;
}

