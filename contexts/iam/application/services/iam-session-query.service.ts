import type { ResolveSessionQuery } from "../../domain/model/queries/resolve-session.query";
import type { ResolvedSession } from "../model/resolved-session";

export interface IamSessionQueryService {
  resolveSession(query: ResolveSessionQuery): Promise<ResolvedSession>;
}
