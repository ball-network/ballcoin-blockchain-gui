import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import ballFormatter from './ballFormatter';

export default function ballToMojo(ball: string | number | BigNumber): BigNumber {
  return ballFormatter(ball, Unit.BALL)
    .to(Unit.MOJO)
    .toBigNumber();
}
