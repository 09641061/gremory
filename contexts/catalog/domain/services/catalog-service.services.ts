import type {
  CreateCatalogServiceCommand,
  UpdateCatalogServiceCommand,
  ChangeCatalogServiceStatusCommand,
  DeleteCatalogServiceCommand,
} from "../model/commands/catalog-service.commands";
import type { CatalogService } from "../model/entities/catalog-service.entity";
import type { DetailedServiceDTO } from "../../application/model/catalog-view.models";

export interface CatalogServiceSearchParams {
  establishmentId: string;
  categoryId?: string;
  search?: string;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export interface CatalogServiceCommandService {
  create(command: CreateCatalogServiceCommand, token?: string): Promise<CatalogService>;
  update(command: UpdateCatalogServiceCommand, token?: string): Promise<CatalogService>;
  changeStatus(command: ChangeCatalogServiceStatusCommand, token?: string): Promise<void>;
  delete(command: DeleteCatalogServiceCommand, token?: string): Promise<void>;
}

export interface CatalogServiceQueryService {
  search(params: CatalogServiceSearchParams, token?: string): Promise<PageResponse<DetailedServiceDTO>>;
  getById(id: string, establishmentId: string, token?: string): Promise<DetailedServiceDTO>;
}
