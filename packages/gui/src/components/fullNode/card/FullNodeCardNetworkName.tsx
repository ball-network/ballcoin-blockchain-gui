import { useGetNetworkInfoQuery } from '@ball-network/api-react';
import { CardSimple } from '@ball-network/core';
import { Trans } from '@lingui/macro';
import React from 'react';

export default function FullNodeCardNetworkName() {
  const { data: networkInfo, isLoading, error } = useGetNetworkInfoQuery();
  const value = networkInfo?.networkName;

  return (
    <CardSimple
      loading={isLoading}
      valueColor="textPrimary"
      title={<Trans>Network Name</Trans>}
      value={value}
      error={error}
    />
  );
}
