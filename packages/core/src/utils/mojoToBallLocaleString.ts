import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import ballFormatter from './ballFormatter';

export default function mojoToBallLocaleString(mojo: string | number | BigNumber, locale?: string) {
  return ballFormatter(mojo, Unit.MOJO)
    .to(Unit.BALL)
    .toLocaleString(locale);
}
