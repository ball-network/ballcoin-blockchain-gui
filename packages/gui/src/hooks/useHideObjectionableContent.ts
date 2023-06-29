import { usePrefs } from '@ball-network/api-react';

export default function useHideObjectionableContent() {
  return usePrefs<boolean>('hideObjectionableContent', true);
}
