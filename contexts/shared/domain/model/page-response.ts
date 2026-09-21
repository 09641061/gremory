/**
 * Domain-owned pagination shape. Mirrors the runtime contract validated by
 * the Infrastructure gateway; Application ports consume it and never
 * import the Infrastructure schema.
 */
export type PageResponse<T> = Readonly<{
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}>;
