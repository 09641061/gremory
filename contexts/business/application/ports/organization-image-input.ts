/**
 * Transport-neutral organization image payload. Domain depends on this shape
 * only; the `File` / `FormData` conversion happens inside the Infrastructure
 * adapter.
 */
export type OrganizationImageInput = Readonly<{
  name: string;
  type: string;
  size: number;
  bytes: Uint8Array;
}>;
