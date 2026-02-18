// SonicStreamPay Contract ABI (simplified for frontend use)
export const STREAM_PAY_ABI = [
  // Read functions
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'sender', type: 'address' },
    ],
    name: 'getBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
    ],
    name: 'getStream',
    outputs: [
      { name: 'amountPerSec', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'stopTime', type: 'uint256' },
      { name: 'withdrawn', type: 'uint256' },
      { name: 'withdrawableAmount', type: 'uint256' },
      { name: 'senderBalance', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
    ],
    name: 'withdrawable',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amountPerSec', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
    ],
    name: 'createStream',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amountPerSec', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
      { name: 'depositAmount', type: 'uint256' },
    ],
    name: 'createStreamWithDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'sender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipient', type: 'address' },
    ],
    name: 'cancelStream',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'token', type: 'address' },
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: true, name: 'recipient', type: 'address' },
      { indexed: false, name: 'amountPerSec', type: 'uint256' },
      { indexed: false, name: 'startTime', type: 'uint256' },
      { indexed: false, name: 'stopTime', type: 'uint256' },
    ],
    name: 'StreamCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'token', type: 'address' },
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: true, name: 'recipient', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Withdrawn',
    type: 'event',
  },
] as const;

// ERC20 ABI for approvals
export const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Contract addresses
export const STREAM_PAY_ADDRESS = {
  mainnet: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Update after mainnet deployment
  testnet: '0x172eD0a96b3366fA552cfDaD3318642Ef3432F02' as `0x${string}`, // Deployed 2025-12-16
};

// Contract addresses by chain ID
export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  146: STREAM_PAY_ADDRESS.mainnet, // Sonic Mainnet
  14601: STREAM_PAY_ADDRESS.testnet, // Sonic Testnet
};

// Supported tokens
export const SUPPORTED_TOKENS = {
  mainnet: [
    {
      symbol: 'wS',
      name: 'Wrapped Sonic',
      address: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38' as `0x${string}`,
      decimals: 18,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894' as `0x${string}`,
      decimals: 6,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x6047828dc181963ba44c82d2a5f290c36b3f4141' as `0x${string}`,
      decimals: 6,
    },
  ],
  testnet: [
    {
      symbol: 'TEST',
      name: 'Test Token',
      address: '0x34179076D61091f003C024713B9c2fEcf164aeCB' as `0x${string}`,
      decimals: 18,
    },
  ],
};
