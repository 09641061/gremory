/**
 * IAM authentication command service — Application layer.
 *
 * The command contract is owned by Application (`IamAuthenticationWriter`).
 * The gateway in `infrastructure/gateways/iam-api.gateway.ts` implements
 * that port directly; `interfaces/server/iam-composition.ts` is the only
 * place allowed to instantiate the gateway and inject it. This file stays
 * so legacy imports remain valid but no longer carries a hard dependency
 * on Infrastructure.
 */
export type { IamAuthenticationWriter } from "../../ports/iam-authentication-writer";
