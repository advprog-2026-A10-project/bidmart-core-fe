import type { PaginationDTO } from "~/modules/catalog/application/dtos/catalog.dto";
import type { PaginatedCatalogListings } from "~/modules/catalog/domain/entities/catalog";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";

export class ListMyListingsUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(params: PaginationDTO): Promise<PaginatedCatalogListings> {
    return this.catalogRepository.listMyListings(params);
  }
}
