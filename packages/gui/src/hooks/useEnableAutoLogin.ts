import { usePrefs } from '@ball-network/api-react';

export default function useEnableAutoLogin() {
  return usePrefs<boolean>('enableAutoLogin', true);
}
