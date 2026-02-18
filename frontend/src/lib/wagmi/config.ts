import { http, createConfig } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { sonicMainnet, sonicTestnet } from '../sonic/chain';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const wagmiConfig = createConfig({
  chains: [sonicMainnet, sonicTestnet],
  connectors: [
    injected(),
    ...(projectId
      ? [
          walletConnect({
            projectId,
            metadata: {
              name: 'Sonic Stream Pay',
              description: 'Streaming payments on Sonic blockchain',
              url: 'https://sonic-stream-pay.vercel.app',
              icons: ['https://sonic-stream-pay.vercel.app/icon.png'],
            },
          }),
        ]
      : []),
  ],
  transports: {
    [sonicMainnet.id]: http('https://rpc.soniclabs.com'),
    [sonicTestnet.id]: http('https://rpc.testnet.soniclabs.com'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
