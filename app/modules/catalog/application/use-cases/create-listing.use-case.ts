import type { CreateSellerListingDTO } from "~/modules/catalog/application/dtos/catalog.dto";
import type { CatalogListingDetail } from "~/modules/catalog/domain/entities/catalog";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";

export class CreateListingUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(params: CreateSellerListingDTO): Promise<CatalogListingDetail> {
    return this.catalogRepository.createListing(params);
  }
}
