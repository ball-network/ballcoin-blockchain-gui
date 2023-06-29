import BigNumber from 'bignumber.js';

import Unit from '../constants/Unit';
import ballFormatter from './ballFormatter';

export default function mojoToCAT(mojo: string | number | BigNumber): BigNumber {
  return ballFormatter(mojo, Unit.MOJO).to(Unit.CAT).toBigNumber();
}
