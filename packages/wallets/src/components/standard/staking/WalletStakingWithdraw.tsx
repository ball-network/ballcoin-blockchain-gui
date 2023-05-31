import React from 'react';
import { Trans, t } from '@lingui/macro';
import {
  useGetSyncStatusQuery,
  useStakingWithdrawMutation,
} from '@ball-network/api-react';
import {
  Amount,
  ButtonLoading,
  Form,
  Flex,
  Card,
  useOpenDialog,
  ballToMojo,
  getTransactionResult,
  TooltipIcon,
} from '@ball-network/core';
import isNumeric from 'validator/es/lib/isNumeric';
import { useForm } from 'react-hook-form';
import {Typography} from '@mui/material';
import useWallet from '../../../hooks/useWallet';
import CreateWalletSendTransactionResultDialog from '../../WalletSendTransactionResultDialog';

type StakingWithdrawProps = {
  walletId: number;
  fingerprint: number;
};

type StakingWithdrawData = {
  withdrawAmount: string;
  fingerprint: number;
};

export default function WalletStakingWithdraw(props: StakingWithdrawProps) {
  const { walletId, fingerprint } = props;
  const [submissionCount, setSubmissionCount] = React.useState(0);
  const methods = useForm<StakingWithdrawData>({
    defaultValues: {
      withdrawAmount: '',
    },
  });
  const openDialog = useOpenDialog();
  const [stakingWithdraw, { isLoading: isStakingWithdrawLoading }] =
    useStakingWithdrawMutation();
  const { data: walletState, isLoading: isWalletSyncLoading } =
    useGetSyncStatusQuery(
      {},
      {
        pollingInterval: 10000,
      }
    );

  const { wallet } = useWallet(walletId);

  if (!wallet || isWalletSyncLoading) {
    return null;
  }
  const syncing = !!walletState?.syncing;


  async function handleSubmit(data: StakingWithdrawData) {
    if (isStakingWithdrawLoading) {
      return;
    }

    if (syncing) {
      throw new Error(t`Please finish syncing before making a transaction`);
    }
    console.log(data)
    const amount = data.withdrawAmount.trim();
    if (!isNumeric(amount)) {
      throw new Error(t`Please enter a valid numeric amount`);
    }

    const response = await stakingWithdraw({
      amount: ballToMojo(amount),
      fingerprint: fingerprint,
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
      <Typography variant="h6">
        <Trans>Withdraw Staking</Trans>
        &nbsp;
        <TooltipIcon>
          <Trans>
            Withdraw staking. withdraw amount 0 will withdraw all staking
          </Trans>
        </TooltipIcon>
      </Typography>
      <Card>
        <Flex gap={1} alignItems="center">
          <Flex flexGrow={1} gap={1}>
              <Amount
                variant="filled"
                name="withdrawAmount"
                label={<Trans>Withdraw Amount</Trans>}
                data-testid="WalletStakingWithdraw-amount"
                required
                fullWidth
              />
          </Flex>
          <Flex gap={1} alignItems="center">
              <ButtonLoading
                variant="contained"
                color="primary"
                type="submit"
                loading={isStakingWithdrawLoading}
                data-testid="WalletStakingWithdraw-staking"
              >
                <Trans>Withdraw</Trans>
              </ButtonLoading>
          </Flex>
       </Flex>
      </Card>
    </Form>
  );
}
