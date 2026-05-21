import type { GetListingDetailDTO } from "~/modules/catalog/application/dtos/catalog.dto";
import type { CatalogListingDetail } from "~/modules/catalog/domain/entities/catalog";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";

export class GetPublicListingUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(params: GetListingDetailDTO): Promise<CatalogListingDetail> {
    return this.catalogRepository.getPublicListing(params);
  }
}
