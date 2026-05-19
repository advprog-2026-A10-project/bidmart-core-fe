import type { SellerListingActionDTO } from "~/modules/catalog/application/dtos/catalog.dto";
import type { CatalogListingDetail } from "~/modules/catalog/domain/entities/catalog";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";

export class PublishListingUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(params: SellerListingActionDTO): Promise<CatalogListingDetail> {
    return this.catalogRepository.publishListing(params);
  }
}
