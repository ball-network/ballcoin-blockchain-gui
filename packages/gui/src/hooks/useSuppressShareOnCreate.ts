import { usePrefs } from '@ball-network/api-react';

export default function useSuppressShareOnCreate() {
  return usePrefs<boolean>('suppressShareOnCreate', false);
}
