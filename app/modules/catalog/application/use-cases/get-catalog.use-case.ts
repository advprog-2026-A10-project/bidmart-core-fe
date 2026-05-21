import type { BrowseCatalogDTO } from "~/modules/catalog/application/dtos/catalog.dto";
import type { PaginatedCatalogListings } from "~/modules/catalog/domain/entities/catalog";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";

export class GetCatalogUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(params: BrowseCatalogDTO): Promise<PaginatedCatalogListings> {
    return this.catalogRepository.browseCatalog(params);
  }
}
