import React from 'react';
import { Trans, t } from '@lingui/macro';
import {
  useGetSyncStatusQuery,
  useStakingSendMutation,
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

type StakingSendProps = {
  walletId: number;
  fingerprint: number;
};

type StakingSendData = {
  stakingAmount: string;
};

export default function WalletStakingSend(props: StakingSendProps) {
  const { walletId, fingerprint } = props;
  const [submissionCount, setSubmissionCount] = React.useState(0);
  const methods = useForm<StakingSendData>({
    defaultValues: {
      stakingAmount: '',
    },
  });
  const openDialog = useOpenDialog();
  const [stakingSend, { isLoading: isStakingSendLoading }] = useStakingSendMutation();
  const { data: walletState, isLoading: isWalletSyncLoading } = useGetSyncStatusQuery(
  {}, {
    pollingInterval: 10000,
  });

  const { wallet } = useWallet(walletId);

  if (!wallet || isWalletSyncLoading) {
    return null;
  }
  const syncing = !!walletState?.syncing;


  async function handleSubmit(data: StakingSendData) {
    if (isStakingSendLoading) {
      return;
    }

    if (syncing) {
      throw new Error(t`Please finish syncing before making a transaction`);
    }

    const amount = data.stakingAmount.trim();
    if (!isNumeric(amount)) {
      throw new Error(t`Please enter a valid numeric amount`);
    }

    const response = await stakingSend({
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
        <Trans>Create Staking</Trans>
        &nbsp;
        <TooltipIcon>
          <Trans>
            Staking will make farming BALL easier.
          </Trans>
        </TooltipIcon>
      </Typography>
      <Card>
        <Flex gap={1} alignItems="center">
          <Flex flexGrow={1} gap={1}>
            <Amount
              variant="filled"
              name="stakingAmount"
              label={<Trans>Staking Amount</Trans>}
              data-testid="WalletStakingSend-amount"
              required
              fullWidth
            />
          </Flex>
          <Flex gap={1} alignItems="center">
            <ButtonLoading
              variant="contained"
              color="primary"
              type="submit"
              loading={isStakingSendLoading}
              data-testid="WalletStakingSend-staking"
            >
              <Trans>Staking</Trans>
            </ButtonLoading>
          </Flex>
       </Flex>
      </Card>
     </Form>
  );
}
