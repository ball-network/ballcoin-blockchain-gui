import { WalletType } from '@ball-network/api';
import type { Wallet } from '@ball-network/api';

export default function getWalletPrimaryTitle(wallet: Wallet): string {
  switch (wallet.type) {
    case WalletType.STANDARD_WALLET:
      return 'Ball';
    default:
      return wallet.meta?.name ?? wallet.name;
  }
}
