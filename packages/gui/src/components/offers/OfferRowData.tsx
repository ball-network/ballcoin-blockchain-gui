import { WalletType } from '@ball-network/api';

type OfferRowData = {
  amount: string;
  assetWalletId: number; // 0 if no selection made
  walletType: WalletType;
};

export default OfferRowData;
