import { z } from "zod";

/**
 * Shared Zod schema for paginated REST responses. Mirrors the backend
 * `shared.interfaces.rest.resources.PageResponse<T>` record.
 *
 * Pages are intentionally strict (no `.optional()`) because the backend now
 * always emits `{ content, page, size, totalElements, totalPages }`. Any
 * deviation is a contract break that should surface as a parse failure,
 * not be silently tolerated.
 */
export const pageResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    content: z.array(item),
    page: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  });
