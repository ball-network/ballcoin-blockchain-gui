import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { WalletType } from '@ball-network/api';
import { useGetWalletBalanceQuery } from '@ball-network/api-react';
import {
  FormatLargeNumber,
  mojoToCATLocaleString,
  mojoToBallLocaleString,
  useLocale,
} from '@ball-network/core';
import { useWallet } from '@ball-network/wallets';

export type OfferBuilderWalletBalanceProps = {
  walletId: number;
};

export default function OfferBuilderWalletBalance(
  props: OfferBuilderWalletBalanceProps,
) {
  const { walletId } = props;
  const [locale] = useLocale();
  const { data: walletBalance, isLoading: isLoadingWalletBalance } =
    useGetWalletBalanceQuery({
      walletId,
    });

  const { unit, wallet, loading } = useWallet(walletId);

  const isLoading = isLoadingWalletBalance || loading;

  const ballBalance = useMemo(() => {
    if (
      isLoading ||
      !wallet ||
      !walletBalance ||
      !('spendableBalance' in walletBalance)
    ) {
      return undefined;
    }

    if (wallet.type === WalletType.STANDARD_WALLET) {
      return mojoToBallLocaleString(walletBalance.spendableBalance, locale);
    }

    if (wallet.type === WalletType.CAT) {
      return mojoToCATLocaleString(walletBalance.spendableBalance, locale);
    }

    return undefined;
  }, [
    isLoading,
    wallet,
    walletBalance,
    walletBalance?.spendableBalance,
    locale,
  ]);

  if (!isLoading && ballBalance === undefined) {
    return null;
  }

  return (
    <Trans>
      Spendable Balance:{' '}
      {isLoading ? (
        'Loading...'
      ) : (
        <>
          {ballBalance}
          &nbsp;
          {unit?.toUpperCase()}
        </>
      )}
    </Trans>
  );
}
