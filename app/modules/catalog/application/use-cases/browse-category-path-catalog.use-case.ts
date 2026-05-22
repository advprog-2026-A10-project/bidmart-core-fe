import type { BrowseCategoryPathDTO } from "~/modules/catalog/application/dtos/catalog.dto";
import type { PaginatedCatalogListings } from "~/modules/catalog/domain/entities/catalog";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";

export class BrowseCategoryPathCatalogUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(params: BrowseCategoryPathDTO): Promise<PaginatedCatalogListings> {
    return this.catalogRepository.browseCategoryPath(params);
  }
}
