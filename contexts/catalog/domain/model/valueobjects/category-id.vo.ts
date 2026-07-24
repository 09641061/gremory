export type CategoryId = Readonly<{ value: string }>;

export function createCategoryId(value: string): CategoryId {
  if (!value || !value.trim()) {
    throw new Error("CategoryId is required");
  }
  return Object.freeze({ value });
}
