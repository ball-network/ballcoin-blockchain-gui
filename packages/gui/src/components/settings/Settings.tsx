import { useLocalStorage } from '@ball-network/api-react';
import { Flex, LayoutDashboardSub, Mode, useMode } from '@ball-network/core';
import { msg, Trans } from '@lingui/macro';
import { Typography, Tab, Tabs } from '@mui/material';
import Badge from '@mui/material/Badge';
import React, { useMemo } from 'react';
import { Routes, Route, matchPath, useLocation, useNavigate } from 'react-router-dom';

import SettingsAdvanced from './SettingsAdvanced';
import SettingsCustody from './SettingsCustody';
import SettingsDataLayer from './SettingsDataLayer';
import SettingsGeneral from './SettingsGeneral';
import SettingsHarvester from './SettingsHarvester';
import SettingsIntegration from './SettingsIntegration';
import SettingsNFT from './SettingsNFT';
import SettingsNotifications from './SettingsNotifications';
import SettingsProfiles from './SettingsProfiles';

const pathPrefix = '/dashboard/settings/';

export default function Settings() {
  const [mode] = useMode();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [wasSettingsCustodyVisited] = useLocalStorage<boolean>('newFlag--wasSettingsCustodyVisited', false);

  const settingsTabs = useMemo(() => {
    let tabs = [
      { id: 'general', label: msg`General`, Component: SettingsGeneral, path: 'general' },
      {
        id: 'custody',
        label: msg`Custody`,
        Component: SettingsCustody,
        path: 'custody',
        badge: wasSettingsCustodyVisited ? undefined : 'NEW',
      },
      { id: 'profiles', label: msg`Profiles (DIDs)`, Component: SettingsProfiles, path: 'profiles/*' },
      { id: 'nft', label: msg`NFT`, Component: SettingsNFT, path: 'nft' },
      { id: 'datalayer', label: msg`DataLayer`, Component: SettingsDataLayer, path: 'datalayer' },
      { id: 'harvester', label: msg`Harvester`, Component: SettingsHarvester, path: 'harvester' },
      { id: 'integration', label: msg`Integration`, Component: SettingsIntegration, path: 'integration' },
      { id: 'notifications', label: msg`Notifications`, Component: SettingsNotifications, path: 'notifications' },
      { id: 'advanced', label: msg`Advanced`, Component: SettingsAdvanced, path: 'advanced' },
    ];
    if (mode === Mode.WALLET) {
      tabs = tabs.filter((t) => t.id !== 'harvester');
    }
    return tabs;
  }, [wasSettingsCustodyVisited, mode]);

  const activeTabId = settingsTabs.find((tab) => !!matchPath(pathPrefix + tab.path, pathname))?.id;

  function handleChangeTab(newTabId: string) {
    const newTab = settingsTabs.find((tab) => tab.id === newTabId);
    if (!newTab) {
      return;
    }

    let path = pathPrefix + newTab.path;

    // The path in the settingsTabs is used for matching, so it might contain a wildcard.
    // So we need to remove /* from the path to navigate to the correct path.
    if (path.endsWith('/*')) {
      path = path.slice(0, -2);
    }

    navigate(path);
  }

  return (
    <LayoutDashboardSub>
      <Flex flexDirection="column" gap={3}>
        <Typography variant="h5">
          <Trans>Settings</Trans>
        </Typography>
        <Flex gap={3} flexDirection="column">
          <Tabs
            value={activeTabId || settingsTabs[0].id}
            onChange={(_event, newValue) => handleChangeTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ '& .MuiTabs-flexContainer': { paddingTop: '10px' } }}
          >
            {settingsTabs.map((tab) => {
              let TabLabel = <Trans id={tab.label.id} />;
              if (tab.badge) {
                TabLabel = (
                  <Badge
                    badgeContent={tab.badge}
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        top: '-10px',
                      },
                    }}
                  >
                    {TabLabel}
                  </Badge>
                );
              }
              return (
                <Tab
                  value={tab.id}
                  label={TabLabel}
                  data-testid={`Settings-tab-${tab.id}`}
                  key={tab.id}
                  sx={{ overflow: 'visible' }}
                />
              );
            })}
          </Tabs>

          <Routes>
            {settingsTabs.map(({ id, path, Component }) => (
              <Route path={path} element={<Component />} key={id} />
            ))}
          </Routes>
        </Flex>
      </Flex>
    </LayoutDashboardSub>
  );
}
