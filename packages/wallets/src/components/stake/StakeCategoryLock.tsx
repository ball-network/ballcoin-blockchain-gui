import {
  useStakeInfoQuery,
} from '@ball-network/api-react';
import {
  Flex,
  CardSimple,
} from '@ball-network/core';
import { Trans } from '@lingui/macro';
import { Grid } from '@mui/material';
import React from 'react';

import useWallet from "../../hooks/useWallet";
import useWalletHumanValue from "../../hooks/useWalletHumanValue";

import StakeHistory from "./StakeHistory";
import StakeSend from "./StakeSend";

type StakeRewardProps = {
  walletId: number;
};

export default function StakeCategoryLock(props: StakeRewardProps) {
  const { walletId } = props;
  const { wallet, unit = '', loading } = useWallet(walletId);

  const {
    data: stakeInfo,
    isLoading: isLoadingStakeInfo,
    error,
  } = useStakeInfoQuery({walletId, isStakeFarm: false},{
    pollingInterval: 10_000,
  });

  const isLoading = loading || isLoadingStakeInfo;

  const stakeReward = useWalletHumanValue(wallet, stakeInfo?.stakeReward, unit);
  const balance = useWalletHumanValue(wallet, stakeInfo?.balance, unit);
  const balanceExp = useWalletHumanValue(wallet, stakeInfo?.balanceExp, unit);

  const stakeList = stakeInfo?.stakeList || [];
  const stakeMin = stakeInfo?.stakeMin || 0;

  return (
      <Flex gap={2} flexDirection="column">
        <Grid spacing={2} container>
          <Grid xs={12} md={6} lg={4} item>
             <CardSimple
              loading={isLoading}
              valueColor="secondary"
              title={<Trans>Stake Lock Reward</Trans>}
              value={stakeReward}
              error={error}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} item>
             <CardSimple
              loading={isLoading}
              valueColor="secondary"
              title={<Trans>Stake Lock Balance</Trans>}
              value={balance}
              error={error}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} item>
             <CardSimple
              loading={isLoading}
              valueColor="secondary"
              title={<Trans>Stake Lock Expiration 24H</Trans>}
              value={balanceExp}
              error={error}
            />
          </Grid>
        </Grid>
        <StakeSend
          walletId={walletId}
          isStakeFarm={false}
          stakeList={stakeList}
          stakeMin={stakeMin}
        />
        <StakeHistory
          walletId={walletId}
          isStakeFarm={false}
          stakeList={stakeList}
        />
      </Flex>
  );
}
