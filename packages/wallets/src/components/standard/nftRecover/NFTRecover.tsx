import React from 'react';
import { Trans, t } from '@lingui/macro';
import {
  useLocalStorage,
  useFindPoolNFTMutation,
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
  mojoToBallLocaleString,
  useCurrencyCode,
  useLocale,
} from '@ball-network/core';

import {Grid, Typography} from '@mui/material';
import { useForm } from 'react-hook-form';
import useWallet from "../../../hooks/useWallet";

type NFTRecoverProps = {
  walletId: number;
};

type FindNFTData = {
  launcherId: string;
  contractAddress: string;
};

type RecoverNFTData = {
  launcherId: string;
  contractAddress: string;
};

function validLauncherId(id: string) {
  return !!id && (id.startsWith("0x") && 66 === id.length || !id.startsWith("0x") && 64 === id.length)
}

export default function NFTRecover(props: NFTRecoverProps) {
  const { walletId } = props;
  const currencyCode = useCurrencyCode();
  const [locale] = useLocale();
  const { wallet } = useWallet(walletId);
  const [launcherId, setLauncherId] = useLocalStorage<string>('launcher_id', "");
  const [contractAddress, setContractAddress] = useLocalStorage<string>('contract_address', "");
  const [typography, setContent] = React.useState(" ")
  const [nftData, setNFTData] = React.useState({
    totalAmount: 0,
    balanceAmount: 0,
    recordAmount: 0,
    contractAddress: "",
  })
  const [recoverPoolNFT, { isLoading: isRecoverPoolNFTLoading, error: recoverPoolNFTError }] = useRecoverPoolNFTMutation();
  const [findPoolNFT, { isLoading: isFindPoolNFTLoading, error: findPoolNFTError }] = useFindPoolNFTMutation();
  const findMethods = useForm<FindNFTData>({
    defaultValues: {
      launcherId: launcherId,
      contractAddress: contractAddress,
    },
  });
  const recoverMethods = useForm<RecoverNFTData>({
    defaultValues: {
      launcherId: launcherId,
      contractAddress: contractAddress,
    },
  });
  if (!wallet) {
    return null;
  }

  async function handleNFTSearch(data: FindNFTData) {
    const launcher = data.launcherId.trim();
    if (!validLauncherId(launcher)) {
      throw new Error(t`Please enter a valid NFT Launcher Id`);
    }
    const address = data.contractAddress.trim();
    if (launcher != launcherId) {
      setLauncherId(launcher);
    }
    const response = await findPoolNFT({
      launcherId: launcher,
      contractAddress: address,
    }).unwrap();
    const err = findPoolNFTError ? findPoolNFTError+'' : ''
    setContent(err);
    if (!err) {
      setNFTData(response);
      if (contractAddress != response.contractAddress) {
        setContractAddress(response.contractAddress);
      }
    }
  }

  async function handleSubmit() {
    if (isRecoverPoolNFTLoading || !launcherId) {
      return;
    }
    const response = await recoverPoolNFT({
     launcherId,
     contractAddress,
    }).unwrap();
    const t1 = t`Recovered Amount:`;
    const t2 = t`Status:`;
    const t3 = response.status == 'SUCCESS' ? t`SUCCESS` : t`FAILED`;
    setContent(t1 + " " + mojoToBall(response.amount) + " " + currencyCode+", "+t2 + " "+t3 +
      (recoverPoolNFTError ? ', ' + recoverPoolNFTError+' ' : ' '));
  }

  return (
      <Flex gap={2} flexDirection="column">
        <Form methods={findMethods} onSubmit={handleNFTSearch}>
        <Typography variant="h6">
          <Trans>NFT Recover</Trans>
          &nbsp;
          <TooltipIcon>
            <Trans>visiting the Pool tab of your CHIA-GUI.
              using this command: chia plotNFT show.
              Note: you have to do this on the CHIA client, not the fork!
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
                    loading={isFindPoolNFTLoading}
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
                name="contractAddress"
                variant="filled"
                color="secondary"
                label={<Trans>contract address</Trans>}
                data-testid="NFTRecover-contractAddress"
                fullWidth
              />
          </Card>
          </Grid>
          <Grid xs={12} md={4} item>
            <CardSimple
              valueColor="secondary"
              title={<Trans>Total Balance</Trans>}
              tooltip={<Trans>Total Balance</Trans>}
              value={mojoToBallLocaleString(nftData.totalAmount, locale)}
            />
          </Grid>
          <Grid xs={12} md={4} item>
            <CardSimple
              valueColor="secondary"
              title={<Trans>Not Available Balance</Trans>}
              tooltip={<Trans>Not Available Balance</Trans>}
              value={mojoToBallLocaleString(nftData.balanceAmount, locale)}
            />
          </Grid>
          <Grid xs={12} md={4} item>
            <CardSimple
              valueColor="secondary"
              title={<Trans>Available Balance</Trans>}
              tooltip={<Trans>You can only claim rewards older than 7 days</Trans>}
              value={mojoToBallLocaleString(nftData.recordAmount, locale)}
            />
          </Grid>
        </Grid>
        </Form>
        <Typography variant="body1" color="textSecondary"  dangerouslySetInnerHTML={{__html: typography}} />
        <Flex justifyContent="flex-end" gap={1}>
          <Form methods={recoverMethods} onSubmit={handleSubmit}>
            <ButtonLoading
              variant="contained"
              color="primary"
              type="submit"
              disable={nftData.recordAmount==0||nftData.contractAddress==""}
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
