import { useGetTotalHarvestersSummaryQuery } from '@ball-network/api-react';
import { FormatBytes, CardSimple } from '@ball-network/core';
import { Trans } from '@lingui/macro';
import React from 'react';

export default React.memo(TotalSizeOfPlots);
function TotalSizeOfPlots() {
  const { totalEffectivePlotSize, isLoading } = useGetTotalHarvestersSummaryQuery();

  return (
    <CardSimple
      title={<Trans>Farming Space</Trans>}
      value={<FormatBytes value={totalEffectivePlotSize} precision={3} effectiveSize />}
      loading={isLoading}
    />
  );
}
