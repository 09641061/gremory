import {
  clearSessionRoute,
  createSessionRoute,
} from "@/contexts/iam/interfaces/rest/routes/session.route";

export const POST = createSessionRoute;
export const DELETE = clearSessionRoute;
