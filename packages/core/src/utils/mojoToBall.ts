import BigNumber from 'bignumber.js';

import Unit from '../constants/Unit';

import ballFormatter from './ballFormatter';

export default function mojoToBall(mojo: string | number | BigNumber): BigNumber {
  return ballFormatter(mojo, Unit.MOJO).to(Unit.BALL).toBigNumber();
}
