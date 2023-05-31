import { useLocalStorage } from '@ball-network/api-react';

export default function useEnableAutoLogin() {
  return useLocalStorage<boolean>('enableAutoLogin', true);
}
