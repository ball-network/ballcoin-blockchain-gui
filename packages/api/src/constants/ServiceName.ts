const ServiceName = {
  WALLET: 'ball_wallet',
  FULL_NODE: 'ball_full_node',
  FARMER: 'ball_farmer',
  HARVESTER: 'ball_harvester',
  SIMULATOR: 'ball_full_node_simulator',
  DAEMON: 'daemon',
  PLOTTER: 'ball_plotter',
  TIMELORD: 'ball_timelord',
  INTRODUCER: 'ball_introducer',
  EVENTS: 'wallet_ui',
  DATALAYER: 'ball_data_layer',
  DATALAYER_SERVER: 'ball_data_layer_http',
} as const;

type ObjectValues<T> = T[keyof T];

export type ServiceNameValue = ObjectValues<typeof ServiceName>;

export default ServiceName;
