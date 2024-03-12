# ballcoin-blockchain-gui/api

![Ball logo](https://www.ballcoin.vip/wp-content/uploads/2022/09/ball-logo.svg)

![GitHub contributors](https://img.shields.io/github/contributors/ball-network/ballcoin-blockchain-gui?logo=GitHub)

This library provides support for TypeScript/JavaScript [Ball](https://www.ballcoin.vip) apps to access the [BallCoin Blockchain RPC](https://docs.ballcoin.vip/rpc/), by making it easier to perform the following actions:

- Making requests to the BallCoin Blockchain RPC.
- Catch responses and errors with standard try/catch and async/await syntax.
- Catch error when the request has a timeout. Each request has a default timeout of 10 minutes.
- Auto-connect to daemon when you send the first request.
- Auto-reconnect when the connection was disconnected.
- Transforming request/response and using standard [camel case](https://en.wikipedia.org/wiki/Camel_case) format for properties and responses. Internally will be everything converted to [snake case](https://en.wikipedia.org/wiki/Snake_case).
- Providing types for requests and responses.

## Example

```ts
import { readFileSync } from "fs";
import Client, { Wallet } from '@ball-network/api'; // or from "../ballcoin-blockchain/ballcoin-blockchain-gui/packages/api";
import Websocket from 'ws';
import sleep from 'sleep-promise';

(async () => {
  const client = new Client({
    url: 'wss://127.0.0.1:23320',
    // key and crt files should be in your homedir in: .ball/mainnet/config/ssl/daemon/
    cert: readFileSync('private_cert.crt'),
    key: readFileSync('private_key.key'),
    webSocket: Websocket;
  });

  const wallet = new Wallet(client);

  try {
    // get list of available public keys
    const publicKeys = await wallet.getPublicKeys();

    // bind to sync changes
    const unsubscribeSyncChanges = wallet.onSyncChanged((syncData) => {
      console.log('do something with synchronization data');
    });

    // wait 5 minutes
    await sleep(1000 * 60 * 5);

    // unsubscribe from synchronization changes
    await unsubscribeSyncChanges();

    // wait 5 minutes
    await sleep(1000 * 60 * 5);

    // close client and stop all services
    await client.close();
  } catch (error: any) {
    // something went wrong (timeout or error on the backend side)
    console.log(error.message);
  }
})();
```

## Development

Please read and follow the main [README.md](https://github.com/ball-network/ballcoin-blockchain-gui) of this monorepo.
