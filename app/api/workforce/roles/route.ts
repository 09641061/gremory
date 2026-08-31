import {
  createWorkforceRoleRoute,
  listWorkforceRolesRoute,
} from "@/contexts/workforce/interfaces/rest/routes/workforce-role.route";

export const GET = listWorkforceRolesRoute;
export const POST = createWorkforceRoleRoute;
