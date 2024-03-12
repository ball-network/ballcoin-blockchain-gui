import type BigNumber from 'bignumber.js';

type AutoWithdrawStake = {
  txFee: number | BigNumber;
  batchSize: number;
};

export default AutoWithdrawStake;
