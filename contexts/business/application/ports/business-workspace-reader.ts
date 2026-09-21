import type {
  BusinessWorkspaceQuery,
  BusinessWorkspaceSelection,
} from "../model/workspace-selection";
import type { BusinessWorkspaceResource } from "../model/workspace-resource";
import type { WorkspaceHeaderViewModel } from "../model/business-workspace.view-models";

/**
 * Server-only reader for the authenticated workspace snapshot. Implementation
 * lives in Infrastructure and is injected through composition; Application
 * only sees the consumer-owned `BusinessWorkspaceSelection`, the
 * `BusinessWorkspaceResource` view type, and the `WorkspaceHeaderViewModel`
 * it ultimately returns.
 */
export interface BusinessWorkspaceReader {
  fetchResource(selection?: BusinessWorkspaceSelection): Promise<BusinessWorkspaceResource>;
  getHeaderViewModel(query?: BusinessWorkspaceQuery): Promise<WorkspaceHeaderViewModel>;
  getSelection(): Promise<BusinessWorkspaceSelection>;
}
