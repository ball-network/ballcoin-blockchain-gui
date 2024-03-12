import { useLocalStorage } from '@ball-network/api-react';
import { Flex, SettingsLabel } from '@ball-network/core';
import { Trans } from '@lingui/macro';
import { FormGroup, FormControlLabel, Grid, Switch } from '@mui/material';
import React from 'react';

export default function SettingsStartup() {
  const [enableVerifiableCredentials, toggleVerifiableCredentials] = useLocalStorage<boolean>(
    'enable-verifiable-credentials',
    false
  );
  const [enableNFTs, toggleNFTs] = useLocalStorage<boolean>('enable-nfts',false);
  const [enableOffers, toggleOffers] = useLocalStorage<boolean>('enable-offers',false);
  const [enablePool, togglePool] = useLocalStorage<boolean>('enable-pool',false);
  return (
    <Grid container>
      <Grid item>
        <Flex flexDirection="column" gap={1}>
          <SettingsLabel>
            <Trans>DashboardSideBar</Trans>
          </SettingsLabel>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={enableVerifiableCredentials}
                  onChange={() => toggleVerifiableCredentials(!enableVerifiableCredentials)}
                />
              }
              label={<Trans>Enable Verifiable Credentials</Trans>}
            />
          </FormGroup>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={enableNFTs}
                  onChange={() => toggleNFTs(!enableNFTs)}
                />
              }
              label={<Trans>Enable NFTs</Trans>}
            />
          </FormGroup>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={enableOffers}
                  onChange={() => toggleOffers(!enableOffers)}
                />
              }
              label={<Trans>Enable Offers</Trans>}
            />
          </FormGroup>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={enablePool}
                  onChange={() => togglePool(!enablePool)}
                />
              }
              label={<Trans>Enable Pool</Trans>}
            />
          </FormGroup>
        </Flex>
      </Grid>
    </Grid>
  );
}
