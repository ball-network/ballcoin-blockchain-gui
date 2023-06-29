import defaultsForPlotter from '../utils/defaultsForPlotter';
import optionsForPlotter from '../utils/optionsForPlotter';
import PlotterName from './PlotterName';

export default {
  displayName: 'Ball Proof of Space',
  options: optionsForPlotter(PlotterName.BALLPOS),
  defaults: defaultsForPlotter(PlotterName.BALLPOS),
  installInfo: { installed: true },
};
