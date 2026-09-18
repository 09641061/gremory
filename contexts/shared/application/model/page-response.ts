export type PageResponse<T> = Readonly<{
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}>;
