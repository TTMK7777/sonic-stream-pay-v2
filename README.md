# Sonic Stream Pay

A real-time streaming payment protocol built on the [Sonic blockchain](https://soniclabs.com). Send and receive ERC-20 tokens by the second — no batch transactions, no waiting.

## Overview

Sonic Stream Pay enables continuous, per-second token transfers between any two addresses. Senders deposit funds upfront and the contract releases them to recipients as time passes. Recipients can withdraw their accrued balance at any time, and senders can cancel an active stream and recover unspent funds instantly.

Sonic's high throughput (10,000 TPS), sub-second finality (~0.7s), and ultra-low fees (~$0.001/tx) make per-second micropayments economically viable for the first time on a public blockchain.

### Use Cases

- DAO / Web3 payroll — pay contributors in real time instead of monthly lump sums
- GameFi rewards — stream in-game earnings as players complete actions
- Creator subscriptions — pay only for the time actually consumed
- DeFi integrations — combine with lending/yield protocols for productive idle balances

## Features

- **Per-second streaming** — 20-digit precision (1e20) prevents rounding errors even for low-decimal tokens (USDC, USDT)
- **Deposit-and-stream** — `createStreamWithDeposit` combines approval, deposit, and stream creation in one transaction
- **Flexible duration** — fixed-term streams or open-ended (no stop time)
- **Instant withdrawal** — recipients withdraw accrued balance at any time; balance cap prevents over-withdrawal
- **Stream cancellation** — senders cancel and receive unspent deposit back; accrued amount is sent to recipient atomically
- **Protocol fee** — configurable basis-point fee (starts at 0%, max 1%) collected on withdrawals
- **Emergency pause** — owner can pause all contract interactions
- **Multi-token** — works with any ERC-20 token (wS, USDC, USDT, and more)

## Architecture

```
sonic-stream-pay/
├── contracts/                    # Hardhat project
│   ├── contracts/
│   │   ├── SonicStreamPay.sol    # Core streaming payment contract
│   │   └── MockERC20.sol         # Test token (testing only)
│   ├── scripts/
│   │   └── deploy.ts             # Deployment script
│   ├── test/
│   │   └── SonicStreamPay.test.ts
│   └── hardhat.config.ts
└── frontend/                     # Next.js application
    └── src/
        ├── app/
        │   ├── page.tsx           # Dashboard
        │   ├── create/page.tsx    # Create stream form
        │   └── streams/page.tsx   # Active streams list
        ├── components/
        │   ├── layout/Header.tsx
        │   ├── providers/Web3Provider.tsx
        │   └── wallet/ConnectButton.tsx
        ├── hooks/
        │   └── useStreamPay.ts    # Contract interaction hooks
        └── lib/
            ├── sonic/
            │   ├── chain.ts       # Sonic Mainnet / Testnet chain definitions
            │   └── contracts.ts   # ABI and deployed contract addresses
            └── wagmi/
                └── config.ts      # wagmi client configuration
```

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.20, OpenZeppelin v5 |
| Contract Tooling | Hardhat, hardhat-toolbox, TypeChain |
| Frontend Framework | Next.js 15, React 19 |
| Blockchain Client | viem v2, wagmi v2 |
| Wallet Integration | WalletConnect v2, injected wallets |
| Styling | Tailwind CSS |
| Language | TypeScript (strict) |

## Deployed Contracts

| Network | Address |
|---|---|
| Sonic Testnet (chainId 14601) | `0x172eD0a96b3366fA552cfDaD3318642Ef3432F02` |
| Sonic Mainnet (chainId 146) | Not yet deployed |

## Supported Tokens (Mainnet)

| Symbol | Contract Address | Decimals |
|---|---|---|
| wS (Wrapped Sonic) | `0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38` | 18 |
| USDC | `0x29219dd400f2Bf60E5a23d13Be72B486D4038894` | 6 |
| USDT | `0x6047828dc181963ba44c82d2a5f290c36b3f4141` | 6 |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/TTMK7777/sonic-stream-pay-v2.git
cd sonic-stream-pay-v2
```

### 2. Set up contracts

```bash
cd contracts
npm install
cp .env.example .env
# Edit .env with your values (see Environment Variables section)
```

### 3. Set up frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values
```

## Environment Variables

### contracts/.env

| Variable | Description |
|---|---|
| `PRIVATE_KEY` | Deployer wallet private key (without `0x` prefix) |
| `SONICSCAN_API_KEY` | SonicScan API key for contract verification |

### frontend/.env.local

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID ([get one here](https://cloud.walletconnect.com)) |

## Running Locally

### Contracts

```bash
cd contracts

# Compile contracts
npm run compile

# Run tests
npm test

# Start local Hardhat node (optional)
npx hardhat node
```

### Frontend

```bash
cd frontend

# Development server
npm run dev
# App runs at http://localhost:3000

# Production build
npm run build
npm start
```

## Smart Contract Deployment

### Deploy to Sonic Testnet

```bash
cd contracts
npm run deploy:testnet
```

### Deploy to Sonic Mainnet

```bash
cd contracts
npm run deploy:mainnet
```

### Verify on SonicScan

After deployment, verify the contract source:

```bash
cd contracts
npx hardhat verify --network sonicMainnet <DEPLOYED_CONTRACT_ADDRESS>
```

After deployment, update `STREAM_PAY_ADDRESS.mainnet` in `frontend/src/lib/sonic/contracts.ts` with the new address.

## Contract Interface

```solidity
// Deposit ERC-20 tokens to fund streams
function deposit(address token, uint256 amount) external;

// Create a new stream (requires prior deposit)
function createStream(
    address token,
    address recipient,
    uint256 amountPerSec,
    uint256 duration          // 0 = indefinite
) external;

// Deposit and create stream in one transaction
function createStreamWithDeposit(
    address token,
    address recipient,
    uint256 amountPerSec,
    uint256 duration,
    uint256 depositAmount
) external;

// Recipient: withdraw accrued balance (0 = withdraw max)
function withdraw(address token, address sender, uint256 amount) external;

// Sender: cancel stream and recover unspent deposit
function cancelStream(address token, address recipient) external;

// View: withdrawable amount for a recipient (with PRECISION)
function withdrawable(address token, address sender, address recipient) external view returns (uint256);
```

## Security

- `ReentrancyGuard` on all state-mutating functions
- `SafeERC20` for all token transfers
- `Ownable` for admin functions (protocol fee, pause)
- 20-digit internal precision to prevent rounding loss on low-decimal tokens
- Balance cap on withdrawals prevents over-payment if sender's deposit runs dry

> **Note:** This contract has not undergone a formal security audit. Use on mainnet at your own risk.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://opensource.org/licenses/MIT)
