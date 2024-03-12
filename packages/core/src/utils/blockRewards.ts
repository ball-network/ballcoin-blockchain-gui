import BigNumber from 'bignumber.js';

const MOJO_PER_BALL = new BigNumber('1000000000000');
const REWARD_PER_VALUE: Array<[number, number]> = [
  [1_000_000, 1],
  [2_000_000, 0.6],
  [10_000_000, 0.4],
  [20_000_000, 0.2],
  [30_000_000, 0.1],
  [40_000_000, 0.05],
  [50_000_000, 0.02],
];
const POOL_REWARD = '0.875'; // 7 / 8
const FARMER_REWARD = '0.125'; // 1 /8
const STAKE_REWARD = '4';

export function calculateReward(height: number, index: number = 0): number {
  if (height > 50_000_000) {
    return 0.01
  }
  const [heightPer, rewardPer] = REWARD_PER_VALUE[index]
  return height < heightPer ? rewardPer : calculateReward(height, index + 1);
}

export function calculatePoolReward(height: number): BigNumber {
  if (height === 0) {
    return MOJO_PER_BALL.times(3_000_000).times(POOL_REWARD)
  }
  return MOJO_PER_BALL.times(calculateReward(height)).times(POOL_REWARD);
}

export function calculateBaseFarmerReward(height: number): BigNumber {

  if (height === 0) {
    return MOJO_PER_BALL.times(3_000_000).times(FARMER_REWARD)
  }
  return MOJO_PER_BALL.times(calculateReward(height)).times(FARMER_REWARD);
}

export function calculateStakeReward(height: number): BigNumber {
  return MOJO_PER_BALL.times(calculateReward(height)).times(STAKE_REWARD);
}
