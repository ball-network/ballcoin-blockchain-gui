import React from 'react';
import { Trans } from '@lingui/macro';
import {
  useGetLoggedInFingerprintQuery,
  useStakingInfoQuery,
} from '@ball-network/api-react';
import {
  Loading,
  Flex,
  Card,
  CopyToClipboard,
  useCurrencyCode,
  mojoToBallLocaleString,
  useLocale,
} from '@ball-network/core';
import {TextField, InputAdornment} from '@mui/material';
import WalletStakingSend from "./WalletStakingSend";
import WalletStakingWithdraw from "./WalletStakingWithdraw";

type StakingProps = {
  walletId: number;
};

export default function WalletStaking(props: StakingProps) {
  const { walletId } = props;
  const currencyCode = useCurrencyCode();
  const [locale] = useLocale();
  const { data: fingerprint, isLoading: isLoadingFingerprint } = useGetLoggedInFingerprintQuery();
  const { data: stakingInfo, isLoading: isLoadingStakingInfo } = useStakingInfoQuery({
    fingerprint
  },{
    pollingInterval: 10000,
  });

  if (!fingerprint || isLoadingFingerprint || isLoadingStakingInfo) {
    return null;
  }

  const balance = mojoToBallLocaleString(stakingInfo?.balance, locale);
  const address = stakingInfo?.address || '';

  return (
      <Flex gap={2} flexDirection="column">
        <Card>
          {isLoadingStakingInfo ? (
            <Loading center />
          ) : (
          <Flex gap={2} flexDirection="column">
            <TextField
              label={<Trans>Staking Balance</Trans>}
              value={balance}
              variant="filled"
              inputProps={{
                'data-testid': 'WalletStakingAddress-balance',
                readOnly: true,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">{currencyCode}</InputAdornment>
                ),
              }}
              fullWidth
            />
            <TextField
              label={<Trans>Staking Address</Trans>}
              value={address}
              variant="filled"
              inputProps={{
                'data-testid': 'WalletStakingAddress-address',
                readOnly: true,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CopyToClipboard
                      value={address}
                      data-testid="WalletStakingAddress-address-copy"
                    />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Flex>
          )}
        </Card>
        <WalletStakingSend walletId={walletId} fingerprint={fingerprint} />
        <WalletStakingWithdraw walletId={walletId} fingerprint={fingerprint} />
      </Flex>
  );
}
