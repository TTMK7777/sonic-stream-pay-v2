'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering wallet state until mounted
  if (!mounted) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg opacity-50"
      >
        Connect Wallet
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">{chain?.name || 'Unknown'}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        const injected = connectors.find((c) => c.id === 'injected');
        if (injected) {
          connect({ connector: injected });
        }
      }}
      disabled={isPending}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
