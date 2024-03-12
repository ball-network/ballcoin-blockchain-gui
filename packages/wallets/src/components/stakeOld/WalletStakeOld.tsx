import React from 'react';
import {t, Trans} from '@lingui/macro';
import {
  useGetSyncStatusQuery,
  useStakeInfoOldQuery,
  useStakeWithdrawOldMutation,
} from '@ball-network/api-react';
import {
  Amount,
  Back,
  ButtonLoading,
  Card,
  CardSimple,
  Flex,
  Form,
  CopyToClipboard,
  useOpenDialog,
  ballToMojo,
  getTransactionResult,
  TooltipIcon,
} from '@ball-network/core';
import {Typography, Grid, Tooltip, Box} from '@mui/material';
import CreateWalletSendTransactionResultDialog from '../WalletSendTransactionResultDialog';
import {useForm} from "react-hook-form";
import isNumeric from "validator/es/lib/isNumeric";
import useWalletHumanValue from "../../hooks/useWalletHumanValue";
import useWallet from "../../hooks/useWallet";

type StakeOldProps = {
  walletId: number;
  referrerPath?: string;
};

type StakeWithdrawData = {
  amount: string;
};

export default function WalletStakeOld(props: StakeOldProps) {
  const { walletId, referrerPath } = props;
  const { wallet, unit = '' } = useWallet(walletId);
  const [submissionCount, setSubmissionCount] = React.useState(0);
  const methods = useForm<StakeWithdrawData>({
    defaultValues: {
      amount: '',
    },
  });
  const openDialog = useOpenDialog();
  const [
    stakeWithdrawOld, { isLoading: isSubmitting }
  ] = useStakeWithdrawOldMutation();
  const {
    data: walletState
  } = useGetSyncStatusQuery({},{
    pollingInterval: 10_000,
  });
  const { data: stakeInfo, isLoading: isStakeInfoLoading, error } = useStakeInfoOldQuery({
    walletId
  },{
    pollingInterval: 10_000,
  });

  const syncing = !!walletState?.syncing;
  const balance = useWalletHumanValue(wallet, stakeInfo?.balance ?? 0, unit);
  const address = stakeInfo?.address ?? '';

  async function handleSubmit(data: StakeWithdrawData) {
    if (isSubmitting) {
      return;
    }

    if (syncing) {
      throw new Error(t`Please finish syncing before making a transaction`);
    }
    const amount = data.amount.trim();
    if (!isNumeric(amount)) {
      throw new Error(t`Please enter a valid numeric amount`);
    }

    const response = await stakeWithdrawOld({
      walletId,
      amount: ballToMojo(amount),
      waitForConfirmation: true,
    }).unwrap();

    const result = getTransactionResult(response.transaction);
    const resultDialog = CreateWalletSendTransactionResultDialog({
      success: result.success,
      message: result.message,
    });

    if (resultDialog) {
      await openDialog(resultDialog);
    } else {
      throw new Error(result.message ?? 'Something went wrong');
    }

    methods.reset();
    setSubmissionCount((prev) => prev + 1);
  }

  return (
      <Form methods={methods} key={submissionCount} onSubmit={handleSubmit}>
        <Flex gap={2} flexDirection="column">
          <Flex alignItems="center" justifyContent="space-between" gap={2}>
          <Back to={referrerPath} alignItems="flex-start" iconStyle={{ marginTop: -0.5 }}>
            <Flex flexDirection="column">
              <Typography variant="h5">
                <Trans>Old Stake Withdraw</Trans>
                &nbsp;
                <TooltipIcon>
                  <Trans>Withdraw amount 0 will withdraw all stake</Trans>
                </TooltipIcon>
              </Typography>
            </Flex>
          </Back>
        </Flex>
          <Card>
            <Grid spacing={2} container>
              <Grid xs={12} md={12} item>
                <CardSimple
                    loading={isStakeInfoLoading}
                    title={<Trans>Old Stake Address</Trans>}
                    value={<Tooltip title={
                      <Flex flexDirection="column" gap={1}>
                          <Flex flexDirection="row" alignItems="center" gap={1}>
                            <Box maxWidth={200}>{address}</Box>
                            <CopyToClipboard value={address} fontSize="small" />
                          </Flex>
                        </Flex>
                      }>
                      <span> {address}</span>
                    </Tooltip>}
                    error={error}
                  />
              </Grid>
              <Grid xs={12} md={12} item>
                 <CardSimple
                  loading={isStakeInfoLoading}
                  valueColor="secondary"
                  title={<Trans>Old Stake Balance</Trans>}
                  value={balance}
                  error={error}
                />
              </Grid>
              <Grid xs={12} md={12} item>
                <Amount
                  id="filled-secondary"
                  variant="filled"
                  name="amount"
                  color="secondary"
                  disabled={isSubmitting}
                  label={<Trans>Amount</Trans>}
                  data-testid="WalletStakeWithdrawOld-amount"
                  required
                  fullWidth
                />
              </Grid>
            </Grid>
          </Card>
          <Flex justifyContent="flex-end" gap={1}>
              <ButtonLoading
                variant="contained"
                color="primary"
                type="submit"
                loading={isSubmitting}
                data-testid="WalletStakeWithdrawOld-withdraw"
              >
                <Trans>Withdraw</Trans>
              </ButtonLoading>
          </Flex>
        </Flex>
      </Form>
  );
}
