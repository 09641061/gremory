export type CatalogServiceId = Readonly<{ value: string }>;

export function createCatalogServiceId(value: string): CatalogServiceId {
  if (!value || !value.trim()) {
    throw new Error("CatalogServiceId is required");
  }
  return Object.freeze({ value });
}
