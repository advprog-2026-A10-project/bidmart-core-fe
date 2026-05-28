import type { SellerListingActionDTO } from "~/modules/catalog/application/dtos/catalog.dto";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";

export class CancelListingUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(params: SellerListingActionDTO): Promise<void> {
    await this.catalogRepository.cancelListing(params);
  }
}
