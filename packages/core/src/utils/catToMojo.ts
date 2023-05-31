import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import ballFormatter from './ballFormatter';

export default function catToMojo(cat: string | number | BigNumber): BigNumber {
  return ballFormatter(cat, Unit.CAT)
    .to(Unit.MOJO)
    .toBigNumber();
}
