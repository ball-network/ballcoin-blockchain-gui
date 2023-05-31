import { useMemo } from 'react';
import type { Wallet } from '@ball-network/api';
import { WalletType } from '@ball-network/api';
import BigNumber from 'bignumber.js';
import { mojoToCATLocaleString, mojoToBallLocaleString, useLocale } from '@ball-network/core';

export default function useWalletHumanValue(wallet: Wallet, value?: string | number | BigNumber, unit?: string): string {
  const [locale] = useLocale();

  return useMemo(() => {
    if (wallet && value !== undefined) {
      const localisedValue = wallet.type === WalletType.CAT
        ? mojoToCATLocaleString(value, locale)
        : mojoToBallLocaleString(value, locale);

      return `${localisedValue} ${unit}`;
    }

    return '';
  }, [wallet, value, unit, locale]);
}
