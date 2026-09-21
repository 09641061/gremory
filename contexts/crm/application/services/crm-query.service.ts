import type { CrmQueryPort } from "../ports/crm-query.port";
import type { CustomerViewModel } from "../models/customer";
import type { PageResponse as SharedPageResponse } from "@/contexts/shared/application/model/page-response";

/** Application-facing query port; remote response shape remains unchanged. */
export type CrmQueryService = CrmQueryPort;
export type CustomerResponse = CustomerViewModel;
export type PageResponse<T = CustomerViewModel> = SharedPageResponse<T>;
