export type PageResponse<T> = Readonly<{
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  totalPages: number;
  totalElements: number;
  last: boolean;
}>;
