import type { Wallet } from '@ball-network/api';
import { WalletType } from '@ball-network/api';

export default function findCATWalletByAssetId(wallets: Wallet[], assetId: string) {
  return wallets.find(
    (wallet) =>
      [WalletType.CAT, WalletType.CRCAT].includes(wallet.type) &&
      wallet.meta?.assetId?.toLowerCase() === assetId.toLowerCase()
  );
}
