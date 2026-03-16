import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";

/**
 * GetCatalogUseCase — TODO: describe what this use-case does.
 */
export class GetCatalogUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(/* dto: TODO */): Promise<void> {
    // TODO: implement use-case logic using this.catalogRepository
  }
}
