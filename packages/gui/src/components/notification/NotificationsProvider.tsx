import { SyncingStatus } from '@ball-network/api';
import {
  useGetNotificationsQuery,
  usePrefs,
  useDeleteNotificationsMutation,
  useCurrentFingerprintSettings,
} from '@ball-network/api-react';
import { ConfirmDialog, useOpenDialog } from '@ball-network/core';
import { useWalletState } from '@ball-network/wallets';
import { Trans } from '@lingui/macro';
import debug from 'debug';
import { orderBy } from 'lodash';
import React, { useMemo, useState, useEffect, useCallback, createContext, useRef, type ReactNode } from 'react';

import NotificationType from '../../constants/NotificationType';
import useAssetIdName from '../../hooks/useAssetIdName';
import useShowNotification from '../../hooks/useShowNotification';
import fetchOffer from '../../util/fetchOffer';
import parseNotification from '../../util/parseNotification';
import resolveOfferInfo from '../../util/resolveOfferInfo';
import { pushNotificationStringsForNotificationType } from './utils';

const log = debug('ball-gui:useNotifications');

type Notification = {
  id: string;
  message: string;
  height: number;
  debug?: boolean;
};

export type NotificationDetails = Notification & {
  type: NotificationType;
  metadata: {
    type: NotificationType;
    version: number;
    data: Record<string, any>;
  };
  valid: boolean;
  offered?: {
    assetType: string;
    displayName: string;
    displayAmount: number;
  }[];
  requested?: {
    assetType: string;
    displayName: string;
    displayAmount: number;
  }[];
};

export const NotificationsContext = createContext<
  | {
      notifications: NotificationDetails[];
      isLoading: boolean;
      error?: Error;
      unseenCount: number;
      setAsSeen: () => void;
      deleteNotification: (id: string) => void;
      areNotificationsEnabled: boolean;
      setNotificationsEnabled: (enabled: boolean) => void;
      pushNotificationsEnabled: boolean;
      setPushNotificationsEnabled: (enabled: boolean) => void;
    }
  | undefined
>(undefined);

export type NotificationsProviderProps = {
  children: ReactNode;
};

export default function NotificationsProvider(props: NotificationsProviderProps) {
  const { children } = props;

  const {
    data: notifications,
    isLoading: isLoadingNotifications,
    error: getNotificationsError,
  } = useGetNotificationsQuery();
  const { state, isLoading: isLoadingWalletState } = useWalletState();
  const [enabled, setEnabled] = useState<boolean>('enableNotifications', true); // global notification setting. controls push and local notifications
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = usePrefs<boolean>('enablePushNotifications', true); // push notification setting
  const [lastPushNotificationHeight, setLastPushNotificationHeight, { isLoading: isLoadingPushNotificationsHeight }] =
    useCurrentFingerprintSettings<number>('lastPushNotificationHeight', 0);
  const [seenHeight, setSeenHeight, { isLoading: isLoadingSeenHeight }] = useCurrentFingerprintSettings<number>(
    'notificationsSeenHeight',
    0
  );
  const [isPreparingNotifications, setIsPreparingNotifications] = useState<boolean>(true);
  const [preparingError, setPreparingError] = useState<Error | undefined>();
  const preparedNotificationsRef = useRef<NotificationDetails[]>([]);
  const { lookupByAssetId, isLoading: isLoadingAssetIdName } = useAssetIdName();
  const [deleteNotifications] = useDeleteNotificationsMutation();
  const showNotification = useShowNotification();
  const openDialog = useOpenDialog();
  const isSynced = state === SyncingStatus.SYNCED;

  const isLoadingServices =
    !isSynced ||
    isLoadingNotifications ||
    isLoadingWalletState ||
    isLoadingPushNotificationsHeight ||
    isLoadingSeenHeight ||
    isLoadingAssetIdName;

  const isLoading = isLoadingServices || isPreparingNotifications;

  const error = getNotificationsError || preparingError;

  // Debug support
  const allowDebugDesktopNotification = process.env.NODE_ENV === 'development';

  const prepareNotifications = useCallback(async () => {
    if (isLoadingServices) {
      return;
    }

    const debugNotifications = allowDebugDesktopNotification
      ? preparedNotificationsRef.current.filter((notification) => notification.debug)
      : [];

    preparedNotificationsRef.current = [];

    if (!enabled || !notifications) {
      return;
    }

    try {
      setIsPreparingNotifications(true);

      const prepared = (
        await Promise.all(
          notifications.map(async (notification) => {
            try {
              const { message: hexMessage } = notification;
              const message = hexMessage ? Buffer.from(hexMessage, 'hex').toString() : '';
              if (!message) {
                throw new Error('Notification has not message');
              }

              const metadata = parseNotification(message);
              const { type } = metadata;

              if ([NotificationType.OFFER, NotificationType.COUNTER_OFFER].includes(type)) {
                const {
                  data: { url },
                } = metadata;
                const data = await fetchOffer(url);
                const { valid, offerSummary } = data;
                if (!valid) {
                  return null;
                }

                const offered = resolveOfferInfo(offerSummary, 'offered', lookupByAssetId);
                const requested = resolveOfferInfo(offerSummary, 'requested', lookupByAssetId);

                // todo add limit to 1 NFT per offer

                return {
                  type,
                  metadata,
                  offered,
                  requested,
                  ...data,
                  ...notification,
                };
              }

              throw new Error(`Unknown notification type: ${type}`);
            } catch (e) {
              log('Failed to prepare notification', e);
              return null;
            }
          })
        )
      ).filter(Boolean);

      const sortedNotifications = orderBy(prepared, ['height'], ['desc']);

      preparedNotificationsRef.current = [...sortedNotifications, ...debugNotifications];
    } catch (e) {
      setPreparingError(e as Error);
    } finally {
      setIsPreparingNotifications(false);
    }
  }, [isLoadingServices, enabled, notifications, lookupByAssetId, allowDebugDesktopNotification]);

  const showPushNotifications = useCallback(() => {
    if (!enabled || !pushNotificationsEnabled || isLoading) {
      return;
    }

    const firstUnseenNotification = preparedNotificationsRef.current.find(
      (notification) => notification.height > lastPushNotificationHeight
    );

    if (!firstUnseenNotification) {
      return;
    }

    setLastPushNotificationHeight(firstUnseenNotification.height);

    const { title, body } = pushNotificationStringsForNotificationType(
      firstUnseenNotification.type,
      firstUnseenNotification.debug
    );

    showNotification({
      title,
      body,
    });
  }, [
    enabled,
    lastPushNotificationHeight,
    pushNotificationsEnabled,
    setLastPushNotificationHeight,
    showNotification,
    isLoading,
  ]);

  const unseenCount = useMemo(() => {
    if (isLoading) {
      return 0;
    }

    return preparedNotificationsRef.current.filter((notification) => notification.height > seenHeight).length;
  }, [seenHeight, isLoading]);

  useEffect(() => {
    if (!isLoadingServices) {
      prepareNotifications();
    }
  }, [prepareNotifications, isLoadingServices]);

  useEffect(() => {
    showPushNotifications();
  }, [showPushNotifications]);

  const setAsSeen = useCallback(() => {
    const highestHeight = preparedNotificationsRef.current.reduce(
      (acc, notification) => Math.max(notification.height, acc),
      0
    );

    if (highestHeight > seenHeight) {
      setSeenHeight(highestHeight);
    }
  }, [setSeenHeight, seenHeight]);

  const handleDeleteNotification = useCallback(
    async (id: string) => {
      await openDialog(
        <ConfirmDialog
          title={<Trans>Please Confirm</Trans>}
          confirmTitle={<Trans>Delete</Trans>}
          confirmColor="danger"
          onConfirm={() =>
            deleteNotifications({
              ids: [id],
            }).unwrap()
          }
        >
          <Trans>Do you want to remove this offer notification? This action cannot be undone.</Trans>
        </ConfirmDialog>
      );
    },
    [deleteNotifications, openDialog]
  );

  const contextValue = useMemo(
    () => ({
      notifications: isSynced ? preparedNotificationsRef.current : [],
      isLoading,
      error,
      unseenCount,
      setAsSeen,
      deleteNotification: handleDeleteNotification,
      areNotificationsEnabled: enabled,
      setNotificationsEnabled: setEnabled,
      pushNotificationsEnabled,
      setPushNotificationsEnabled,
    }),
    [
      isLoading,
      error,
      unseenCount,
      setAsSeen,
      handleDeleteNotification,
      enabled,
      setEnabled,
      pushNotificationsEnabled,
      setPushNotificationsEnabled,
      isSynced,
    ]
  );

  const debugTriggerNotificationHandler = useCallback(() => {
    if (!allowDebugDesktopNotification) {
      return;
    }

    const currentNotifications = preparedNotificationsRef.current;
    const maxHeight = currentNotifications.reduce(
      (acc, notification) => Math.max(acc, notification.height),
      lastPushNotificationHeight
    );
    // create a dummy notification for debugging
    const dummyNotification: NotificationDetails = {
      id: `dummy_id_${Math.random()}`,
      message: 'dummy_message',
      height: maxHeight + 1,
      debug: true,
      type: NotificationType.OFFER,
      metadata: {
        type: NotificationType.OFFER,
        version: 1,
        data: {
          ph: 'dummy_puzzle_hash',
          url: 'dummy_url',
        },
      },
      valid: true,
      offered: [
        {
          assetType: 'BALL',
          displayName: 'BALL',
          displayAmount: 1,
        },
      ],
      requested: [
        {
          assetType: 'NFT',
          displayName: 'Dummy NFT',
          displayAmount: 1,
        },
      ],
    };

    currentNotifications.unshift(dummyNotification);

    preparedNotificationsRef.current = currentNotifications;

    showPushNotifications();
  }, [allowDebugDesktopNotification, showPushNotifications, lastPushNotificationHeight]);

  useEffect(() => {
    const { ipcRenderer } = window as any;
    ipcRenderer.on('debug_triggerDesktopNotification', debugTriggerNotificationHandler);

    return () => {
      ipcRenderer.removeListener('debug_triggerDesktopNotification', debugTriggerNotificationHandler);
    };
  }, [debugTriggerNotificationHandler]);

  return <NotificationsContext.Provider value={contextValue}>{children}</NotificationsContext.Provider>;
}
