import type { UpdateSellerListingDTO } from "~/modules/catalog/application/dtos/catalog.dto";
import type { CatalogListingDetail } from "~/modules/catalog/domain/entities/catalog";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";

export class UpdateListingUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(params: UpdateSellerListingDTO): Promise<CatalogListingDetail> {
    return this.catalogRepository.updateListing(params);
  }
}
