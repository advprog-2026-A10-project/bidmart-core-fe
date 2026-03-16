import type { IWalletRepository } from "~/modules/wallet/domain/repositories/wallet-repository.interface";

/**
 * GetWalletUseCase — TODO: describe what this use-case does.
 */
export class GetWalletUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(/* dto: TODO */): Promise<void> {
    // TODO: implement use-case logic using this.walletRepository
  }
}
