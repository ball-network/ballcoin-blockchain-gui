import React from 'react';
import { Trans, t } from '@lingui/macro';
import {
  useLocalStorage,
  useFindPoolNFTQuery,
  useRecoverPoolNFTMutation,
} from '@ball-network/api-react';
import {
  Flex,
  Form,
  Card,
  ButtonLoading,
  TextField,
  CardSimple,
  TooltipIcon,
  mojoToBall,
} from '@ball-network/core';
import {Grid, Typography} from '@mui/material';
import { useForm } from 'react-hook-form';
import useWallet from "../../../hooks/useWallet";
import useWalletHumanValue from "../../../hooks/useWalletHumanValue";

type NFTRecoverProps = {
  walletId: number;
};
type NFTRecoveryData = {
  launcherId: string;
};
function validLauncherId(id: string) {
  return !!id && (id.startsWith("0x") && 66 === id.length || !id.startsWith("0x") && 64 === id.length)
}

export default function NFTRecover(props: NFTRecoverProps) {
  const { walletId } = props;
  const [launcherId, setLauncherId] = useLocalStorage<string>('launcher_id', '');
  const [typography, setContent] = React.useState(" ")
  const methods = useForm<NFTRecoveryData>({
    defaultValues: {
      launcherId: launcherId,
    },
  });
  const [recoverPoolNFT, { isLoading: isRecoverPoolNFTLoading, error: recoverPoolNFTError }] =
    useRecoverPoolNFTMutation();
  const { data: poolNFT, isLoading: isLoadingFindPoolNFT, error: findPoolNFTNFTError } =
    useFindPoolNFTQuery(
      {
        launcherId
      },
      {
        pollingInterval: 10000,
      }
  );
  const { wallet, unit = '', loading } = useWallet(walletId);

  const isLoading = loading || isLoadingFindPoolNFT;

  const totalAmount = useWalletHumanValue(wallet, poolNFT?.totalAmount, unit);
  const balanceAmount = useWalletHumanValue(wallet, poolNFT?.balanceAmount, unit);
  const recordAmountVal =poolNFT?.recordAmount;
  const recordAmount = useWalletHumanValue(wallet, recordAmountVal, unit);
  const contractAddress = poolNFT?.contractAddress || '';

  async function handleNFTSearch(data: NFTRecoveryData) {
    const launcherIdVal = data.launcherId.trim();
    if (!validLauncherId(launcherIdVal)) {
      throw new Error(t`Please enter a valid NFT Launcher Id`);
    }
    setContent('');
    setLauncherId(launcherIdVal);
  }
  async function handleSubmit(data: NFTRecoveryData) {
    if (isRecoverPoolNFTLoading) {
      return;
    }
    const launcherIdVal = data.launcherId.trim();
    if (!validLauncherId(launcherIdVal)) {
      throw new Error(t`Please enter a valid NFT Launcher Id`);
    }
    const response = await recoverPoolNFT({
     launcherId: launcherIdVal,
    }).unwrap();
    const t1 = t`Recovered Amount:`;
    const t2 = t`Status:`;
    const t3 = response.status == 'SUCCESS' ? t`SUCCESS` : t`FAILED`;
    setContent(t1 + " " + mojoToBall(response.amount) + " " + unit+", "+t2 + " "+t3 +
      (recoverPoolNFTError ? ', ' + recoverPoolNFTError+' ' : ' ') +
      (findPoolNFTNFTError ? ', ' + findPoolNFTNFTError+' ' : ' '));
  }

  return (
      <Flex gap={2} flexDirection="column">
        <Form methods={methods} onSubmit={handleNFTSearch}>
        <Typography variant="h6">
          <Trans>NFT Recover</Trans>
          &nbsp;
          <TooltipIcon>
            <Trans>visiting the Pool tab of your BALLCOIN-GUI.
              using this command: ballcoin plotNFT show.
              Note: you have to do this on the BALLCOIN client, not the fork!
            </Trans>
          </TooltipIcon>
        </Typography>
        <Grid spacing={2} alignItems="stretch" container>
          <Grid xs={12} md={12} item>
            <Card>
              <Flex gap={2} flexDirection="center">
                <Flex flexGrow={1} gap={1}>
                  <TextField
                    name="launcherId"
                    variant="filled"
                    color="secondary"
                    label={<Trans>Launcher Id</Trans>}
                    data-testid="NFTRecover-launcherId"
                    fullWidth
                    required
                  />
                </Flex>
                <Flex gap={1} alignItems="center">
                  <ButtonLoading
                    variant="contained"
                    color="primary"
                    type="submit"
                    loading={isLoading}
                    data-testid="NFTRecover-find"
                  >
                    <Trans>Find</Trans>
                  </ButtonLoading>
                </Flex>
              </Flex>
            </Card>
          </Grid>
          <Grid xs={12} md={12} item>
            <Card>
              <TextField
                label={<Trans>contract address</Trans>}
                value={contractAddress}
                variant="filled"
                color="secondary"
                inputProps={{
                  'data-testid': 'NFTRecover-contractAddress',
                  readOnly: true,
                }}
                fullWidth
              />
          </Card>
          </Grid>
          <Grid xs={12} md={4} item>
            <CardSimple
              valueColor="secondary"
              title={<Trans>Total Balance</Trans>}
              tooltip={<Trans>Total Balance</Trans>}
              value={totalAmount}
            />
          </Grid>
          <Grid xs={12} md={4} item>
            <CardSimple
              valueColor="secondary"
              title={<Trans>Not Available Balance</Trans>}
              tooltip={<Trans>Not Available Balance</Trans>}
              value={balanceAmount}
            />
          </Grid>
          <Grid xs={12} md={4} item>
            <CardSimple
              valueColor="secondary"
              title={<Trans>Available Balance</Trans>}
              tooltip={<Trans>You can only claim rewards older than 7 days</Trans>}
              value={recordAmount}
            />
          </Grid>
        </Grid>
        </Form>
        <Typography variant="body1" color="textSecondary"  dangerouslySetInnerHTML={{__html: typography}} />
        <Flex justifyContent="flex-end" gap={1}>
          <Form methods={methods} onSubmit={handleSubmit}>
            <ButtonLoading
              variant="contained"
              color="primary"
              type="submit"
              disable={recordAmountVal==0||contractAddress==''}
              loading={isRecoverPoolNFTLoading}
              data-testid="NFTRecover-Recover"
            >
              <Trans>Recover</Trans>
            </ButtonLoading>
       </Form>
        </Flex>
      </Flex>
  );
}
