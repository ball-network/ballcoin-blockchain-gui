import {
  useStakeInfoQuery,
} from '@ball-network/api-react';
import {
  Flex,
  CardSimple,
  CopyToClipboard,
  truncateValue,
} from '@ball-network/core';
import { Trans } from '@lingui/macro';
import {Box, Grid, Tooltip} from '@mui/material';
import React from 'react';

import useWallet from "../../hooks/useWallet";
import useWalletHumanValue from "../../hooks/useWalletHumanValue";

import StakeHistory from "./StakeHistory";
import StakeSend from "./StakeSend";

type StakeFarmProps = {
  walletId: number;
};

export default function StakeCategoryFarm(props: StakeFarmProps) {
  const { walletId } = props;
  const { wallet, unit = '', loading } = useWallet(walletId);
  const {
    data: stakeInfo,
    isLoading: isLoadingStakeInfo,
    error,
  } = useStakeInfoQuery({walletId, isStakeFarm: true},{
    pollingInterval: 10_000,
  });

  const isLoading = loading || isLoadingStakeInfo;

  const stakeReward = useWalletHumanValue(wallet, stakeInfo?.stakeReward, unit);
  const balance = useWalletHumanValue(wallet, stakeInfo?.balance, unit);
  const balanceExp = useWalletHumanValue(wallet, stakeInfo?.balanceExp, unit);

  const balanceIncome = useWalletHumanValue(wallet, stakeInfo?.balanceIncome, unit);
  const balanceOther = useWalletHumanValue(wallet, stakeInfo?.balanceOther, unit);
  const address = stakeInfo?.address || '';
  const stakeList = stakeInfo?.stakeList || [];
  const stakeMin = stakeInfo?.stakeMin || 0;


  return (
      <Flex gap={2} flexDirection="column">
        <Grid spacing={2} container>
          <Grid xs={12} md={6} lg={4} item>
             <CardSimple
              loading={isLoading}
              valueColor="secondary"
              title={<Trans>Stake Farm Reward</Trans>}
              value={stakeReward}
              error={error}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} item>
             <CardSimple
              loading={isLoading}
              valueColor="secondary"
              title={<Trans>Stake Farm Balance</Trans>}
              value={balance}
              error={error}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} item>
             <CardSimple
              loading={isLoading}
              valueColor="secondary"
              title={<Trans>Other Stake Farm Balance</Trans>}
              value={balanceOther}
              error={error}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} item>
             <CardSimple
                loading={isLoading}
                valueColor="secondary"
                title={<Trans>Income Stake Farm Balance</Trans>}
                value={balanceIncome}
                error={error}
              />
          </Grid>
          <Grid xs={12} md={6} lg={4} item>
             <CardSimple
              loading={isLoading}
              valueColor="secondary"
              title={<Trans>Stake Farm Expiration 24H</Trans>}
              value={balanceExp}
              error={error}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} item>
             <CardSimple
              loading={isLoading}
              title={<Trans>Stake Farm Address</Trans>}
              value={<Tooltip title={
                <Flex flexDirection="column" gap={1}>
                    <Flex flexDirection="row" alignItems="center" gap={1}>
                      <Box maxWidth={200}>{address}</Box>
                      <CopyToClipboard value={address} fontSize="small" />
                    </Flex>
                  </Flex>
                }>
                <span> {truncateValue(address, {leftLength: 2, rightLength: 6})}</span>
              </Tooltip>}
              error={error}
            />
          </Grid>
        </Grid>
        <StakeSend
          walletId={walletId}
          isStakeFarm
          stakeList={stakeList}
          stakeMin={stakeMin}
        />
        <StakeHistory
          walletId={walletId}
          isStakeFarm
          stakeList={stakeList}
        />
      </Flex>
  );
}
