import { useLocalStorage } from '@ball-network/api-react';

export default function useEnableFilePropagationServer() {
  return useLocalStorage<boolean>('enableFilePropagationServer', false);
}
