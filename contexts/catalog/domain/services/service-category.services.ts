import type {
  CreateServiceCategoryCommand,
  UpdateServiceCategoryCommand,
  DeleteServiceCategoryCommand,
} from "../model/commands/service-category.commands";
import type { ServiceCategory } from "../model/entities/service-category.entity";
import type { PageResponse } from "./catalog-service.services";

export interface ServiceCategoryCommandService {
  create(command: CreateServiceCategoryCommand, token?: string): Promise<ServiceCategory>;
  update(command: UpdateServiceCategoryCommand, token?: string): Promise<ServiceCategory>;
  delete(command: DeleteServiceCategoryCommand, token?: string): Promise<void>;
}

export interface ServiceCategoryQueryService {
  list(establishmentId: string, page?: number, size?: number, token?: string): Promise<PageResponse<ServiceCategory>>;
}
