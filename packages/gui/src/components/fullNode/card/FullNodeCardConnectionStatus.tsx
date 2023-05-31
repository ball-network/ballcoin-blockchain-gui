import React from 'react';
import { Trans } from '@lingui/macro';
import { CardSimple } from '@ball-network/core';
import { ServiceName } from '@ball-network/api';
import { useService } from '@ball-network/api-react';

export default function FullNodeCardConnectionStatus() {
  const { isRunning, isLoading, error } = useService(ServiceName.FULL_NODE);

  return (
    <CardSimple
      loading={isLoading}
      valueColor={isRunning ? 'primary' : 'textPrimary'}
      title={<Trans>Connection Status</Trans>}
      value={
        isRunning ? <Trans>Connected</Trans> : <Trans>Not connected</Trans>
      }
      error={error}
    />
  );
}