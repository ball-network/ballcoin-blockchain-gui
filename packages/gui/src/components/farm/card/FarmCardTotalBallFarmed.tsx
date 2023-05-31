import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useCurrencyCode, mojoToBallLocaleString, CardSimple, useLocale } from '@ball-network/core';
import { useGetFarmedAmountQuery } from '@ball-network/api-react';

export default function FarmCardTotalBallFarmed() {
  const currencyCode = useCurrencyCode();
  const [locale] = useLocale();
  const { data, isLoading, error } = useGetFarmedAmountQuery();

  const farmedAmount = data?.farmedAmount;

  const totalBallFarmed = useMemo(() => {
    if (farmedAmount !== undefined) {
      return (
        <>
          {mojoToBallLocaleString(farmedAmount, locale)}
          &nbsp;
          {currencyCode}
        </>
      );
    }
  }, [farmedAmount, locale, currencyCode]);

  return (
    <CardSimple
      title={<Trans>Total Ball Farmed</Trans>}
      value={totalBallFarmed}
      loading={isLoading}
      error={error}
    />
  );
}
