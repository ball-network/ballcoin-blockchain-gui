import type { Transaction } from '@ball-network/api';
import {  useGetTimestampForHeightQuery, useGetHeightInfoQuery } from '@ball-network/api-react';
import { useTrans } from '@ball-network/core';
import { defineMessage } from '@lingui/macro';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';
import moment from 'moment';
import React from 'react';

type Props = {
  transactionRow: Transaction;
  isStakeFarm: boolean;
};

export default function StakeHistoryChip(props: Props) {
  const { transactionRow,isStakeFarm } = props;


  const { data: height, isLoading: isGetHeightInfoLoading } = useGetHeightInfoQuery(undefined, {
    pollingInterval: 3000,
  });

  const { data: lastBlockTimeStampData, isLoading: isGetTimestampForHeightLoading } = useGetTimestampForHeightQuery({
    height: height || 0,
  });

  const lastBlockTimeStamp = lastBlockTimeStampData?.timestamp || 0;

  const t = useTrans();

  if (isGetHeightInfoLoading || isGetTimestampForHeightLoading || !lastBlockTimeStamp) return null;

  let text = '';
  let color = '';
  const canBeWithdrawAt = moment(transactionRow.createdAtTime * 1000);
  if (transactionRow.metadata?.timeLock) {
    canBeWithdrawAt.add(transactionRow.metadata.timeLock, 'seconds');
  }
  const currentTime = moment.unix(lastBlockTimeStamp - 20);
  // extra 20 seconds so if the auto withdraw stake is enabled, it will not show to button to withdraw it
  // console.log('currentTime___: ', currentTime.format());
  // console.log('canBeWithdrawAt: ', canBeWithdrawAt.format());

  const timeLeft = canBeWithdrawAt.diff(currentTime, 'seconds');
  // const address = transactionRow.metadata?.recipientPuzzleHash;

  if (timeLeft > 0) {
    color = timeLeft < 86_400 ? 'warning' : 'default';
    text = t(
      isStakeFarm ? defineMessage({message: 'Stake in '}) : defineMessage({message: 'Lock in '})
    )+canBeWithdrawAt.from(currentTime, true); // ... 3 days
  } else if (transactionRow.sent === 0) {
    color = 'success'
    text = t(
      defineMessage({
        message: 'Ready to withdraw',
      })
    );
  } else {
    color = 'primary'
    text = t(
      defineMessage({
        message: 'Withdrawing...',
      })
    );
  }
  return (
    <Chip
      size="small"
      variant="outlined"
      color={color}
      icon={<AccessTimeIcon />}
      label={<>{text}</>}
    />
  );
}
