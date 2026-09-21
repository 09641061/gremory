import "server-only";
import { requireIamAccessToken } from "@/contexts/iam/infrastructure/session/iam-access-token";

export class OperationAuthorizationError extends Error {
  constructor(public readonly code: "UNAUTHENTICATED" | "INVALID_RESOURCE" | "FORBIDDEN") {
    super(code === "UNAUTHENTICATED" ? "Authentication required" : code === "INVALID_RESOURCE" ? "Invalid resource" : "Operation not permitted");
    this.name = "OperationAuthorizationError";
  }
}

export async function requireAuthenticatedToken(): Promise<string> {
  try { return await requireIamAccessToken(); }
  catch { throw new OperationAuthorizationError("UNAUTHENTICATED"); }
}
