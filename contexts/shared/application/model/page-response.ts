export type PageResponse<T> = Readonly<{
  content: T[];
  pageable?: Readonly<{
    pageNumber?: number;
    pageSize?: number;
  }>;
  page?: Readonly<{
    size?: number;
    number?: number;
    totalElements?: number;
    totalPages?: number;
  }>;
  totalPages?: number;
  totalElements?: number;
  first?: boolean;
  last?: boolean;
}>;
