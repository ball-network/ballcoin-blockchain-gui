import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useCurrencyCode, mojoToBallLocaleString, CardSimple, useLocale } from '@ball-network/core';
import { useGetFarmedAmountQuery } from '@ball-network/api-react';

export default function FarmCardUserFees() {
  const currencyCode = useCurrencyCode();
  const [locale] = useLocale();
  const { data, isLoading, error } = useGetFarmedAmountQuery();

  const feeAmount = data?.feeAmount;

  const userTransactionFees = useMemo(() => {
    if (feeAmount !== undefined) {
      return (
        <>
          {mojoToBallLocaleString(feeAmount, locale)}
          &nbsp;
          {currencyCode}
        </>
      );
    }
  }, [feeAmount, locale, currencyCode]);

  return (
    <CardSimple
      title={<Trans>User Transaction Fees</Trans>}
      value={userTransactionFees}
      loading={isLoading}
      error={error}
    />
  );
}
