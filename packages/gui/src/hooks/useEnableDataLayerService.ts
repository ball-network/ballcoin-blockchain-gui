import { usePrefs } from '@ball-network/api-react';

export default function useEnableDataLayerService() {
  return usePrefs<boolean>('enableDataLayerService', false);
}
