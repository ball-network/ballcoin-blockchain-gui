import PlotterName from './PlotterName';
import optionsForPlotter from '../utils/optionsForPlotter';
import defaultsForPlotter from '../utils/defaultsForPlotter';

export default {
  displayName: 'Ball Proof of Space',
  options: optionsForPlotter(PlotterName.BALLPOS),
  defaults: defaultsForPlotter(PlotterName.BALLPOS),
  installInfo: { installed: true },
};
