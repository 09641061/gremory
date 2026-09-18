import type {
  CreateServiceCategoryCommand,
  UpdateServiceCategoryCommand,
  DeleteServiceCategoryCommand,
} from "../model/commands/service-category.commands";
import type { ServiceCategory } from "../model/entities/service-category.entity";
import type { CategoryDTO } from "../../application/model/catalog-view.models";
import type { PageResponse } from "@/contexts/shared/application/model/page-response";

export interface ServiceCategoryCommandService {
  create(command: CreateServiceCategoryCommand, token?: string): Promise<ServiceCategory>;
  update(command: UpdateServiceCategoryCommand, token?: string): Promise<ServiceCategory>;
  delete(command: DeleteServiceCategoryCommand, token?: string): Promise<void>;
}

export interface ServiceCategoryQueryService {
  list(establishmentId: string, page?: number, size?: number, token?: string): Promise<PageResponse<CategoryDTO>>;
}
