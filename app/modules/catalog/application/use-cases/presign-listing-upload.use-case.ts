import type {
  PresignedListingUploadDTO,
  PresignListingUploadDTO,
} from "~/modules/catalog/application/dtos/catalog.dto";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";

export class PresignListingUploadUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(params: PresignListingUploadDTO): Promise<PresignedListingUploadDTO> {
    return this.catalogRepository.presignListingUpload(params);
  }
}
