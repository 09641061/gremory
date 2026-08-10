import { redirect } from "next/navigation";

/**
 * Compatibility entry point for the workspace route.
 * The active workspace is resolved centrally by the root entry route.
 */
export default function WorkspacePage() {
  redirect("/");
}
