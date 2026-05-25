import type { ListCategoriesDTO } from "~/modules/catalog/application/dtos/catalog.dto";
import type { CatalogCategory } from "~/modules/catalog/domain/entities/catalog";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";

export class ListCategoriesUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(params: ListCategoriesDTO = {}): Promise<CatalogCategory[]> {
    return this.catalogRepository.listCategories(params);
  }
}
