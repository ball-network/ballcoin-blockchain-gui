import { usePrefs } from '@ball-network/api-react';

export default function useEnableFilePropagationServer() {
  return usePrefs<boolean>('enableFilePropagationServer', false);
}
