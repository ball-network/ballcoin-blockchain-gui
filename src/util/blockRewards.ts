import Big from 'big.js';

const MOJO_PER_BALL = Big(1000000000000);
const _REWARD_PER = [
    [100000, 200],
    [200000, 190],
    [300000, 180],
    [400000, 170],
    [500000, 160],
    [700000, 150],
    [900000, 140],
    [1100000, 130],
    [1300000, 120],
    [1600000, 110],
    [1900000, 100],
    [2200000, 90],
    [2500000, 80],
    [3000000, 70],
    [3500000, 60],
    [4000000, 50],
    [4500000, 40],
    [5000000, 30],
    [6000000, 20],
    [7000000, 10],
    [8000000, 8],
    [10000000, 6],
    [12000000, 4],
    [14000000, 3],
    [17000000, 2],
    [20000000, 1],
    [25000000, 0.5],
    [30000000, 0.3],
    [40000000, 0.2],
];
const POOL_REWARD = '0.875'; // 7 / 8
const FARMER_REWARD = '0.125'; // 1 /8
const COMMUNITY_REWARD = '0.06'; // 6 / 100
const TIMELORD_FEE = '0.02'; // 2 / 100

function calculateReward(height: number, index = 0): number {
    if(height >= 40_000_000) {
      return 0.1
    } else {
      const [_height, _reward] = _REWARD_PER[index]
      return height < _height ? _reward : calculateReward(height, ++index);
    }
}

export function calculatePoolReward(height: number): Big {
  return MOJO_PER_BALL.times(calculateReward(height)).times(POOL_REWARD);
}

export function calculateBaseFarmerReward(height: number): Big {
  return MOJO_PER_BALL.times(calculateReward(height)).times(FARMER_REWARD);
}

export function calculateCommunityReward(height: number): Big {
  return MOJO_PER_BALL.times(calculateReward(height)).times(COMMUNITY_REWARD);
}

export function calculateTimelordFee(height: number): Big {
  return MOJO_PER_BALL.times(calculateReward(height)).times(TIMELORD_FEE);
}
